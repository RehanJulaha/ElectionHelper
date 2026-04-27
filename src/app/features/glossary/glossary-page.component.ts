import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { map } from 'rxjs';
import { filterGlossaryByQuery } from '../../../lib/election/glossary';
import type { GlossaryEntry } from '../../../lib/election/schema';
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

  readonly pack = this.packSvc.pack;
  readonly loading = this.packSvc.loading;
  readonly error = this.packSvc.error;
  readonly query = signal<string>('');

  private readonly activeLang = toSignal(
    this.transloco.langChanges$.pipe(map(() => this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() }
  );

  readonly filtered = computed((): GlossaryEntry[] => {
    this.activeLang();
    const p = this.pack();
    const q = this.query();
    if (!p) {
      return [];
    }
    return filterGlossaryByQuery(p.glossary, q, (e) => this.transloco.translate(e.termKey));
  });

  onQueryInput(ev: Event): void {
    const t = ev.target as HTMLInputElement;
    this.query.set(t.value);
  }
}
