import { type EnvironmentProviders } from '@angular/core';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAnalytics } from '@angular/fire/analytics';
import { provideAppCheck } from '@angular/fire/app-check';
import { providePerformance } from '@angular/fire/performance';
import { getAnalytics } from 'firebase/analytics';
import { getApp, initializeApp, type FirebaseOptions } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getPerformance } from 'firebase/performance';
import {
  isFirebaseAnalyticsConfigured,
  isFirebaseWebConfigured,
  isNonEmptyConfigValue,
  readFirebasePublicConfig,
} from './firebase-public';

function firebaseOptions(): FirebaseOptions {
  const cfg = readFirebasePublicConfig();
  const options: FirebaseOptions = {
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    storageBucket: cfg.storageBucket,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId,
  };
  if (isNonEmptyConfigValue(cfg.measurementId)) {
    options.measurementId = cfg.measurementId;
  }
  return options;
}

/**
 * Registers @angular/fire when `firebase-public.json` has a valid web app id.
 * App Check, Performance, and Analytics (GA4) follow Firebase Console configuration.
 */
export function buildFirebaseClientProviders(): readonly EnvironmentProviders[] {
  if (!isFirebaseWebConfigured()) {
    return [];
  }
  const cfg = readFirebasePublicConfig();
  const providers: EnvironmentProviders[] = [provideFirebaseApp(() => initializeApp(firebaseOptions()))];

  if (isNonEmptyConfigValue(cfg.appCheckSiteKey)) {
    providers.push(
      provideAppCheck(() =>
        initializeAppCheck(getApp(), {
          provider: new ReCaptchaEnterpriseProvider(cfg.appCheckSiteKey),
          isTokenAutoRefreshEnabled: true,
        })
      )
    );
  }

  providers.push(providePerformance(() => getPerformance(getApp())));

  if (isFirebaseAnalyticsConfigured()) {
    providers.push(provideAnalytics(() => getAnalytics(getApp())));
  }

  return providers;
}
