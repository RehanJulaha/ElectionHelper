import { Injectable, inject } from '@angular/core';
import { Analytics } from '@angular/fire/analytics';
import { logEvent, type Analytics as FirebaseAnalytics } from 'firebase/analytics';
import { PrivacyConsentService } from './privacy-consent.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsEventsService {
  private readonly analytics = inject(Analytics, { optional: true });
  private readonly consent = inject(PrivacyConsentService);

  private modular(): FirebaseAnalytics | null {
    const inst = this.analytics;
    return inst ? (inst as unknown as FirebaseAnalytics) : null;
  }

  private canLog(): boolean {
    return this.modular() !== null && this.consent.decision() === 'accepted';
  }

  logTimelinePhaseViewed(phaseId: string): void {
    const a = this.modular();
    if (!a || !this.canLog()) {
      return;
    }
    logEvent(a, 'timeline_phase_viewed', { phase_id: phaseId });
  }

  logGlossarySearched(queryLength: number): void {
    const a = this.modular();
    if (!a || !this.canLog()) {
      return;
    }
    logEvent(a, 'glossary_searched', { query_length: queryLength });
  }

  logRoleSwitched(role: string): void {
    const a = this.modular();
    if (!a || !this.canLog()) {
      return;
    }
    logEvent(a, 'role_switched', { role });
  }

  logLanguageChanged(lang: string): void {
    const a = this.modular();
    if (!a || !this.canLog()) {
      return;
    }
    logEvent(a, 'language_changed', { language: lang });
  }
}
