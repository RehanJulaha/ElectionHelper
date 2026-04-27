import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { trace, type FirebasePerformance } from 'firebase/performance';
import { Performance } from '@angular/fire/performance';
import { sortPhasesByOrder, nextPhaseId, previousPhaseId, phaseById } from '../../../lib/election/order';
import type { ElectionPhase } from '../../../lib/election/schema';
import { ROLES, type ElectionRole } from '../../../lib/election/roles';
import { ActiveRoleService } from '../../services/active-role.service';
import { AnalyticsEventsService } from '../../services/analytics-events.service';
import { CloudFunctionsService } from '../../services/cloud-functions.service';
import { ElectionPackService } from '../../services/election-pack.service';
import { RemoteConfigFeatureService } from '../../services/remote-config-feature.service';
import { TimelineChecklistService } from '../../services/timeline-checklist.service';

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
  private readonly analytics = inject(AnalyticsEventsService);
  private readonly checklist = inject(TimelineChecklistService);
  private readonly remote = inject(RemoteConfigFeatureService);
  protected readonly cloudFn = inject(CloudFunctionsService);
  private readonly transloco = inject(TranslocoService);

  readonly pack = this.packSvc.pack;
  readonly loading = this.packSvc.loading;
  readonly error = this.packSvc.error;
  readonly role = this.roleSvc.role;
  readonly roles = ROLES;
  readonly remoteFooterPromo = this.remote.footerPromo;
  readonly rajyaSabhaPreview = this.remote.rajyaSabhaPreview;

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
  protected readonly exportLoading = signal(false);
  protected readonly exportError = signal(false);

  private readonly roleBaseline = signal<ElectionRole | null>(null);

  constructor() {
    const perf = inject(Performance, { optional: true });
    afterNextRender(() => {
      if (!perf) {
        return;
      }
      const modular: FirebasePerformance = perf as unknown as FirebasePerformance;
      const t = trace(modular, 'timeline_first_render');
      t.start();
      queueMicrotask(() => t.stop());
    });

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

    effect((): void => {
      const id = this.selectedId();
      if (id) {
        this.analytics.logTimelinePhaseViewed(id);
      }
    });

    effect((): void => {
      const r = this.role();
      const prev = this.roleBaseline();
      this.roleBaseline.set(r);
      if (prev !== null && prev !== r) {
        this.analytics.logRoleSwitched(r);
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

  isChecked(id: string): boolean {
    return this.checklist.isChecked(id);
  }

  onCheckChange(id: string, ev: Event): void {
    ev.stopPropagation();
    this.checklist.toggle(id);
  }

  exportChecklist(): void {
    const p = this.pack();
    if (!p || !this.cloudFn.isConfigured) {
      return;
    }
    const phases = sortPhasesByOrder(p.phases);
    const rows: string[][] = [
      [
        this.transloco.translate('timelineUi.exportColPhase'),
        this.transloco.translate('timelineUi.exportColChecked'),
      ],
    ];
    for (const ph of phases) {
      rows.push([
        this.transloco.translate(ph.titleKey),
        this.checklist.isChecked(ph.id)
          ? this.transloco.translate('timelineUi.yes')
          : this.transloco.translate('timelineUi.no'),
      ]);
    }
    this.exportLoading.set(true);
    this.exportError.set(false);
    this.cloudFn
      .exportTimelineSheet(rows)
      .then((r) => {
        globalThis.window?.open(r.spreadsheetUrl, '_blank', 'noopener,noreferrer');
      })
      .catch(() => {
        this.exportError.set(true);
      })
      .finally(() => {
        this.exportLoading.set(false);
      });
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
      const prev = previousPhaseId(phases, id);
      if (prev) {
        this.selectPhase(prev);
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
