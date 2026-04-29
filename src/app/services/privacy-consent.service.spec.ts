import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { PrivacyConsentService } from './privacy-consent.service';

describe('PrivacyConsentService', () => {
  beforeEach((): void => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection(), PrivacyConsentService],
    });
  });

  it('defaults to pending', (): void => {
    expect(TestBed.inject(PrivacyConsentService).decision()).toBe('pending');
  });

  it('acceptAnalytics persists accepted', (): void => {
    const svc = TestBed.inject(PrivacyConsentService);
    svc.acceptAnalytics();
    expect(svc.decision()).toBe('accepted');
    expect(localStorage.getItem('epa_dpdpa_measurement_v1')).toBe('accepted');
  });

  it('declineAnalytics persists declined', (): void => {
    const svc = TestBed.inject(PrivacyConsentService);
    svc.declineAnalytics();
    expect(svc.decision()).toBe('declined');
    expect(localStorage.getItem('epa_dpdpa_measurement_v1')).toBe('declined');
  });

  it('hydrateFromStorage restores accepted', (): void => {
    localStorage.setItem('epa_dpdpa_measurement_v1', 'accepted');
    const svc = TestBed.inject(PrivacyConsentService);
    svc.hydrateFromStorage();
    expect(svc.decision()).toBe('accepted');
  });
});
