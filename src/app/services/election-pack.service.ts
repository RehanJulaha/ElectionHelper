import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { getApp } from 'firebase/app';
import type { ElectionPack } from '../../lib/election/schema';
import { safeParseElectionPack } from '../../lib/election/parse';
import { isFirebaseWebConfigured } from '../firebase/firebase-public';
import { catchError, finalize, of, retry } from 'rxjs';
import { RemoteConfigFeatureService } from './remote-config-feature.service';

/** Bundled Lok Sabha education pack (same-origin, cacheable). */
const PACK_ASSET_URL = '/assets/content/india-lok-sabha.json';

/**
 * localStorage key for offline/stale-while-revalidate behaviour.
 * Bump suffix if persisted JSON shape changes incompatibly.
 */
const PACK_STORAGE_KEY = 'epa-election-pack-v1';

export type ElectionPackLoadError = 'parse_failed' | 'network';

@Injectable({ providedIn: 'root' })
export class ElectionPackService {
  private readonly http = inject(HttpClient);
  private readonly remote = inject(RemoteConfigFeatureService);
  private readonly packState = signal<ElectionPack | null>(null);
  private readonly errorState = signal<ElectionPackLoadError | null>(null);
  private readonly loadingState = signal(true);
  private firestorePackInFlight = false;

  readonly pack = this.packState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  constructor() {
    effect((): void => {
      if (this.remote.electionPackChannel() !== 'firestore') {
        return;
      }
      void this.loadPublishedPackFromFirestore();
    });
  }

  /**
   * Loads the election pack from `/assets`, with:
   * - Hydration from localStorage when present (validated) for faster paint and offline fallback.
   * - Retries on transient network errors.
   * - Persistence after a successful parse (Room-like cache for low connectivity).
   */
  loadFromAssets(): void {
    this.errorState.set(null);
    const cached = this.readStoredPack();
    if (cached) {
      this.packState.set(cached);
      this.errorState.set(null);
      this.loadingState.set(false);
    } else {
      this.loadingState.set(true);
    }

    this.http
      .get<unknown>(PACK_ASSET_URL)
      .pipe(
        retry(2),
        catchError(() => of(null)),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe((raw): void => {
        if (raw === null) {
          if (!this.packState()) {
            this.errorState.set('network');
          } else {
            this.errorState.set(null);
          }
          return;
        }
        const parsed = safeParseElectionPack(raw);
        if (parsed.success) {
          this.packState.set(parsed.data);
          this.errorState.set(null);
          this.persistPack(parsed.data);
          return;
        }
        if (!this.packState()) {
          this.errorState.set('parse_failed');
        } else {
          this.errorState.set(null);
        }
      });
  }

  private readStoredPack(): ElectionPack | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(PACK_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = safeParseElectionPack(JSON.parse(raw) as unknown);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  private persistPack(pack: ElectionPack): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(PACK_STORAGE_KEY, JSON.stringify(pack));
    } catch {
      /* quota or private mode — non-fatal */
    }
  }

  /**
   * When Remote Config `election_pack_channel` is `firestore`, overlays the pack from
   * `contentPacks/india-lok-sabha-published` (same schema as the asset JSON).
   */
  private async loadPublishedPackFromFirestore(): Promise<void> {
    if (!isFirebaseWebConfigured() || this.firestorePackInFlight) {
      return;
    }
    this.firestorePackInFlight = true;
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore(getApp());
      const snap = await getDoc(doc(db, 'contentPacks', 'india-lok-sabha-published'));
      if (!snap.exists()) {
        return;
      }
      const parsed = safeParseElectionPack(snap.data() as unknown);
      if (parsed.success) {
        this.packState.set(parsed.data);
        this.errorState.set(null);
        this.persistPack(parsed.data);
      }
    } catch {
      /* App Check / network / rules — keep asset-backed pack */
    } finally {
      this.firestorePackInFlight = false;
    }
  }
}
