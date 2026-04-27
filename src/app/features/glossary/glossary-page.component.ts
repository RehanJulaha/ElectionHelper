import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { map } from 'rxjs';
import { filterGlossaryByQuery } from '../../../lib/election/glossary';
import type { GlossaryEntry } from '../../../lib/election/schema';
import { AnalyticsEventsService } from '../../services/analytics-events.service';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { ElectionPackService } from '../../services/election-pack.service';

@Component({
  standalone: true,
  selector: 'app-glossary-page',
  imports: [TranslocoPipe, TranslocoDirective],
  templateUrl: './glossary-page.component.html',
  styleUrl: './glossary-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlossaryPageComponent {
  private readonly packSvc = inject(ElectionPackService);
  private readonly transloco = inject(TranslocoService);
  private readonly analytics = inject(AnalyticsEventsService);
  private readonly cloudFn = inject(CloudFunctionsService);

  readonly pack = this.packSvc.pack;
  readonly loading = this.packSvc.loading;
  readonly error = this.packSvc.error;
  readonly query = signal<string>('');

  private readonly activeLang = toSignal(
    this.transloco.langChanges$.pipe(map(() => this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() }
  );

  private readonly cloudMapState = signal<Readonly<Record<string, string>>>({});
  protected readonly cloudWorking = signal(false);
  protected readonly cloudError = signal(false);

  private searchLogTimer: ReturnType<typeof setTimeout> | null = null;

  readonly filtered = computed((): GlossaryEntry[] => {
    this.activeLang();
    const p = this.pack();
    const q = this.query();
    if (!p) {
      return [];
    }
    return filterGlossaryByQuery(p.glossary, q, (e) => this.transloco.translate(e.termKey));
  });

  readonly cloudMap = this.cloudMapState.asReadonly();

  readonly showCloudTranslate = computed(
    () => this.activeLang() === 'hi' && this.cloudFn.isConfigured && (this.pack()?.glossary.length ?? 0) > 0
  );

  onQueryInput(ev: Event): void {
    const t = ev.target as HTMLInputElement;
    this.query.set(t.value);
    if (this.searchLogTimer !== null) {
      clearTimeout(this.searchLogTimer);
    }
    const len = t.value.trim().length;
    this.searchLogTimer = setTimeout(() => {
      if (len >= 2) {
        this.analytics.logGlossarySearched(len);
      }
    }, 650);
  }

  runCloudTranslate(): void {
    const p = this.pack();
    if (!p || !this.cloudFn.isConfigured || this.activeLang() !== 'hi') {
      return;
    }
    const entries = [...p.glossary];
    const texts = entries.map((e) => this.transloco.translate(e.definitionKey, {}, 'en'));
    this.cloudWorking.set(true);
    this.cloudError.set(false);
    this.cloudFn
      .glossaryTranslate(texts, 'hi')
      .then((res) => {
        const next: Record<string, string> = {};
        entries.forEach((e, i) => {
          const line = res.translations[i];
          if (typeof line === 'string' && line.length > 0) {
            next[e.id] = line;
          }
        });
        this.cloudMapState.set(next);
      })
      .catch(() => {
        this.cloudError.set(true);
      })
      .finally(() => {
        this.cloudWorking.set(false);
      });
  }
}
