import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { TimelineComponent } from './timeline.component';
import { ElectionPackService } from '../../services/election-pack.service';
import { ActiveRoleService } from '../../services/active-role.service';
import en from '../../../assets/i18n/en.json';
import hi from '../../../assets/i18n/hi.json';
import packJson from '../../../assets/content/india-lok-sabha.json';

describe('TimelineComponent', () => {
  let fixture: ComponentFixture<TimelineComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TimelineComponent,
        TranslocoTestingModule.forRoot({
          langs: { en, hi },
          translocoConfig: { availableLangs: ['en', 'hi'], defaultLang: 'en' },
        }),
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ElectionPackService,
        ActiveRoleService,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TimelineComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    TestBed.inject(ElectionPackService).loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
  it('selects first phase', () => {
    expect(fixture.componentInstance.selectedId()).toBeTruthy();
  });
  it('selectPhase updates id', () => {
    fixture.componentInstance.selectPhase('polling');
    expect(fixture.componentInstance.selectedId()).toBe('polling');
  });
  it('setRole updates role service', () => {
    fixture.componentInstance.setRole('candidate');
    expect(TestBed.inject(ActiveRoleService).role()).toBe('candidate');
  });
  it('toggleSources flips', () => {
    expect(fixture.componentInstance.sourcesOpen()).toBe(false);
    fixture.componentInstance.toggleSources();
    expect(fixture.componentInstance.sourcesOpen()).toBe(true);
  });
  it('arrow down moves selection', () => {
    fixture.componentInstance.selectPhase('schedule-mcc');
    const ev = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    fixture.componentInstance.onListKeydown(ev);
    expect(fixture.componentInstance.selectedId()).not.toBe('schedule-mcc');
  });
  it('arrow up from second goes back', () => {
    const sorted = fixture.componentInstance.sortedPhases();
    if (sorted.length < 2) {
      return;
    }
    fixture.componentInstance.selectPhase(sorted[1]!.id);
    const ev = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    fixture.componentInstance.onListKeydown(ev);
    expect(fixture.componentInstance.selectedId()).toBe(sorted[0]!.id);
  });
  it('home selects first', () => {
    const sorted = fixture.componentInstance.sortedPhases();
    fixture.componentInstance.selectPhase(sorted[sorted.length - 1]!.id);
    const ev = new KeyboardEvent('keydown', { key: 'Home' });
    fixture.componentInstance.onListKeydown(ev);
    expect(fixture.componentInstance.selectedId()).toBe(sorted[0]!.id);
  });
  it('end selects last', () => {
    const sorted = fixture.componentInstance.sortedPhases();
    fixture.componentInstance.selectPhase(sorted[0]!.id);
    const ev = new KeyboardEvent('keydown', { key: 'End' });
    fixture.componentInstance.onListKeydown(ev);
    expect(fixture.componentInstance.selectedId()).toBe(sorted[sorted.length - 1]!.id);
  });
  it('bodyKey respects role', () => {
    TestBed.inject(ActiveRoleService).setRole('observer');
    const sp = fixture.componentInstance.selectedPhase();
    expect(sp).toBeTruthy();
    if (sp) {
      const k = fixture.componentInstance.bodyKey(sp);
      expect(k.length).toBeGreaterThan(0);
    }
  });
  it('sortedPhases length matches pack', () => {
    expect(fixture.componentInstance.sortedPhases().length).toBe(8);
  });
});
