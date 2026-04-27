import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import type { FirebaseOptions } from 'firebase/app';
import firebasePublic from '../../assets/config/firebase-public.json';

type FirebasePublicFile = typeof firebasePublic;

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Initializes Firebase App Check (reCAPTCHA Enterprise) and Performance Monitoring
 * when `src/assets/config/firebase-public.json` contains a valid web config and
 * `appCheckSiteKey`. Safe no-op in local/dev when fields are empty.
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
    const [{ initializeApp, getApps }, { initializeAppCheck, ReCaptchaEnterpriseProvider }, perf] =
      await Promise.all([
        import('firebase/app'),
        import('firebase/app-check'),
        import('firebase/performance'),
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
  }
}
