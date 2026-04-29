import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Analytics } from '@angular/fire/analytics';
import { AnalyticsEventsService } from './analytics-events.service';
import { PrivacyConsentService } from './privacy-consent.service';

describe('AnalyticsEventsService', () => {
  it('no-ops when analytics is not provided', (): void => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        PrivacyConsentService,
        { provide: Analytics, useValue: null },
        AnalyticsEventsService,
      ],
    });
    const svc = TestBed.inject(AnalyticsEventsService);
    expect((): void => {
      svc.logTimelinePhaseViewed('p');
      svc.logGlossarySearched(3);
      svc.logRoleSwitched('voter');
      svc.logLanguageChanged('hi');
      svc.logAssistantQuestionAsked(12);
    }).not.toThrow();
  });
});
