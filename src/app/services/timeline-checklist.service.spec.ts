import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TimelineChecklistService } from './timeline-checklist.service';

describe('TimelineChecklistService', () => {
  beforeEach((): void => {
    localStorage.removeItem('epa-timeline-checklist-v1');
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection(), TimelineChecklistService],
    });
  });

  it('toggle sets phase checked', (): void => {
    const svc = TestBed.inject(TimelineChecklistService);
    expect(svc.isChecked('phase-a')).toBe(false);
    svc.toggle('phase-a');
    expect(svc.isChecked('phase-a')).toBe(true);
    svc.toggle('phase-a');
    expect(svc.isChecked('phase-a')).toBe(false);
  });

  it('persists to localStorage', (): void => {
    const svc = TestBed.inject(TimelineChecklistService);
    svc.toggle('x');
    const raw = localStorage.getItem('epa-timeline-checklist-v1');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '{}') as Record<string, boolean>).toEqual({ x: true });
  });
});
