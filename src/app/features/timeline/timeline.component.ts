import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { sortPhasesByOrder, nextPhaseId, previousPhaseId, phaseById } from '../../../lib/election/order';
import type { ElectionPhase } from '../../../lib/election/schema';
import { ROLES, type ElectionRole } from '../../../lib/election/roles';
import { ActiveRoleService } from '../../services/active-role.service';
import { ElectionPackService } from '../../services/election-pack.service';

@Component({
  standalone: true,
  selector: 'app-timeline',
  imports: [TranslocoPipe, TranslocoDirective],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  private readonly packSvc = inject(ElectionPackService);
  private readonly roleSvc = inject(ActiveRoleService);

  readonly pack = this.packSvc.pack;
  readonly loading = this.packSvc.loading;
  readonly error = this.packSvc.error;
  readonly role = this.roleSvc.role;
  readonly roles = ROLES;

  readonly sortedPhases = computed((): ElectionPhase[] => {
    const p = this.pack();
    return p ? sortPhasesByOrder(p.phases) : [];
  });

  readonly selectedId = signal<string | null>(null);

  readonly selectedPhase = computed((): ElectionPhase | null => {
    const id = this.selectedId();
    const p = this.pack();
    if (!id || !p) {
      return null;
    }
    return phaseById(p.phases, id) ?? null;
  });

  readonly sourcesOpen = signal(false);

  constructor() {
    effect((): void => {
      const phases = this.sortedPhases();
      const cur = this.selectedId();
      if (phases.length === 0) {
        return;
      }
      if (cur === null || !phases.some((x) => x.id === cur)) {
        this.selectedId.set(phases[0]!.id);
      }
    });
  }

  selectPhase(id: string): void {
    this.selectedId.set(id);
    this.sourcesOpen.set(false);
  }

  setRole(r: ElectionRole): void {
    this.roleSvc.setRole(r);
  }

  toggleSources(): void {
    this.sourcesOpen.update((v) => !v);
  }

  bodyKey(sp: ElectionPhase): string {
    return sp.bodyKeys[this.role()];
  }

  onListKeydown(ev: KeyboardEvent): void {
    const phases = this.sortedPhases();
    const id = this.selectedId();
    if (!id || phases.length === 0) {
      return;
    }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
      ev.preventDefault();
      const n = nextPhaseId(phases, id);
      if (n) {
        this.selectPhase(n);
      }
    } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
      ev.preventDefault();
      const p = previousPhaseId(phases, id);
      if (p) {
        this.selectPhase(p);
      }
    } else if (ev.key === 'Home') {
      ev.preventDefault();
      this.selectPhase(phases[0]!.id);
    } else if (ev.key === 'End') {
      ev.preventDefault();
      this.selectPhase(phases[phases.length - 1]!.id);
    }
  }
}
