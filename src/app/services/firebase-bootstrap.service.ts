import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import type { FirebaseOptions } from 'firebase/app';
import firebasePublic from '../../assets/config/firebase-public.json';

type FirebasePublicFile = typeof firebasePublic;

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Initializes Firebase App Check (reCAPTCHA Enterprise), Performance Monitoring,
 * and Analytics (GA4) when `src/assets/config/firebase-public.json` contains a
 * valid web config. Analytics requires a non-empty `measurementId`. Safe no-op
 * in local/dev when fields are empty.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseBootstrapService {
  private readonly doc = inject(DOCUMENT);

  async initializeWhenConfigured(): Promise<void> {
    const cfg = firebasePublic as FirebasePublicFile;
    if (!isNonEmpty(cfg.apiKey) || !isNonEmpty(cfg.projectId) || !isNonEmpty(cfg.appId)) {
      return;
    }
    const options: FirebaseOptions = {
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    };
    if (isNonEmpty(cfg.measurementId)) {
      options.measurementId = cfg.measurementId;
    }
    const [{ initializeApp, getApps }, { initializeAppCheck, ReCaptchaEnterpriseProvider }, perf, analyticsMod] =
      await Promise.all([
        import('firebase/app'),
        import('firebase/app-check'),
        import('firebase/performance'),
        import('firebase/analytics'),
      ]);
    const app = getApps().length > 0 ? getApps()[0]! : initializeApp(options);
    if (isNonEmpty(cfg.appCheckSiteKey)) {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(cfg.appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }
    if (this.doc.defaultView) {
      perf.getPerformance(app);
    }
    if (this.doc.defaultView && isNonEmpty(cfg.measurementId)) {
      const supported = await analyticsMod.isSupported();
      if (supported) {
        analyticsMod.getAnalytics(app);
      }
    }
  }
}
