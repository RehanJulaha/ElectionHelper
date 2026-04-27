import { Injectable, inject, signal } from '@angular/core';
import { Analytics } from '@angular/fire/analytics';
import { setAnalyticsCollectionEnabled, setConsent, type Analytics as FirebaseAnalytics } from 'firebase/analytics';

export type AnalyticsConsentDecision = 'pending' | 'accepted' | 'declined';

const STORAGE_KEY = 'epa_dpdpa_measurement_v1';

@Injectable({ providedIn: 'root' })
export class PrivacyConsentService {
  private readonly analytics = inject(Analytics, { optional: true });

  private readonly decisionState = signal<AnalyticsConsentDecision>('pending');

  readonly decision = this.decisionState.asReadonly();

  constructor() {
    this.hydrateFromStorage();
  }

  hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'accepted' || raw === 'declined') {
        this.decisionState.set(raw);
      } else {
        this.decisionState.set('pending');
      }
    } catch {
      this.decisionState.set('pending');
    }
  }

  acceptAnalytics(): void {
    this.persistDecision('accepted');
  }

  declineAnalytics(): void {
    this.persistDecision('declined');
  }

  private persistDecision(next: Exclude<AnalyticsConsentDecision, 'pending'>): void {
    this.decisionState.set(next);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode */
      }
    }
    this.applyFirebaseMeasurement();
  }

  /** Call after Firebase Analytics is constructed so consent + collection flags apply. */
  syncMeasurementAfterAnalyticsReady(): void {
    this.applyFirebaseMeasurement();
  }

  /**
   * Applies GA4 consent mode + collection flag for the current {@link decision}.
   * No-op when Analytics is not registered (missing `measurementId`).
   */
  private applyFirebaseMeasurement(): void {
    const modular = this.modularAnalytics();
    if (!modular) {
      return;
    }
    const granted = this.decisionState() === 'accepted';
    setConsent({
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    setAnalyticsCollectionEnabled(modular, granted);
  }

  private modularAnalytics(): FirebaseAnalytics | null {
    const inst = this.analytics;
    return inst ? (inst as unknown as FirebaseAnalytics) : null;
  }
}
