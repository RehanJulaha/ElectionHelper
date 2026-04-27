import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'epa-timeline-checklist-v1';

@Injectable({ providedIn: 'root' })
export class TimelineChecklistService {
  private readonly checkedState = signal<Readonly<Record<string, boolean>>>({});

  readonly checked = this.checkedState.asReadonly();

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return;
      }
      this.checkedState.set({ ...(parsed as Record<string, boolean>) });
    } catch {
      /* ignore */
    }
  }

  private persist(next: Readonly<Record<string, boolean>>): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }

  isChecked(phaseId: string): boolean {
    return this.checkedState()[phaseId] === true;
  }

  toggle(phaseId: string): void {
    const cur = { ...this.checkedState() };
    cur[phaseId] = !cur[phaseId];
    this.checkedState.set(cur);
    this.persist(cur);
  }
}
