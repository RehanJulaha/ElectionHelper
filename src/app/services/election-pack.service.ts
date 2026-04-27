import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { ElectionPack } from '../../lib/election/schema';
import { safeParseElectionPack } from '../../lib/election/parse';
import { catchError, finalize, of, retry } from 'rxjs';

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
  private readonly packState = signal<ElectionPack | null>(null);
  private readonly errorState = signal<ElectionPackLoadError | null>(null);
  private readonly loadingState = signal(true);

  readonly pack = this.packState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

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
      .subscribe((raw) => {
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
}
