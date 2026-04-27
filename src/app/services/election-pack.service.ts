import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { ElectionPack } from '../../lib/election/schema';
import { safeParseElectionPack } from '../../lib/election/parse';

@Injectable({ providedIn: 'root' })
export class ElectionPackService {
  private readonly http = inject(HttpClient);
  private readonly packState = signal<ElectionPack | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly loadingState = signal(true);

  readonly pack = this.packState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  loadFromAssets(): void {
    this.loadingState.set(true);
    this.http.get<unknown>('/assets/content/india-lok-sabha.json').subscribe({
      next: (raw) => {
        const parsed = safeParseElectionPack(raw);
        if (parsed.success) {
          this.packState.set(parsed.data);
          this.errorState.set(null);
        } else {
          this.errorState.set('parse_failed');
        }
        this.loadingState.set(false);
      },
      error: () => {
        this.errorState.set('network');
        this.loadingState.set(false);
      },
    });
  }
}
