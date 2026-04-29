import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { getApp } from 'firebase/app';
import type { ElectionPack } from '../../lib/election/schema';
import { safeParseElectionPack } from '../../lib/election/parse';
import { isFirebaseWebConfigured } from '../firebase/firebase-public';
import { catchError, finalize, of, retry } from 'rxjs';
import { RemoteConfigFeatureService } from './remote-config-feature.service';

const PACK_ASSET_URL = '/assets/content/india-lok-sabha.json';

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
      void 0;
    }
  }

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
      void 0;
    } finally {
      this.firestorePackInFlight = false;
    }
  }
}
