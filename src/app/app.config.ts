import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  type EnvironmentProviders,
  inject,
  isDevMode,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp } from '@angular/fire/app';
import { Analytics, provideAnalytics } from '@angular/fire/analytics';
import { provideAppCheck } from '@angular/fire/app-check';
import { providePerformance } from '@angular/fire/performance';
import { getAnalytics } from 'firebase/analytics';
import { getApp, initializeApp, type FirebaseOptions } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getPerformance } from 'firebase/performance';
import { routes } from './app.routes';
import {
  isFirebaseAnalyticsConfigured,
  isFirebaseWebConfigured,
  isNonEmptyConfigValue,
  readFirebasePublicConfig,
} from './firebase/firebase-public';
import { ElectionPackService } from './services/election-pack.service';
import { PrivacyConsentService } from './services/privacy-consent.service';
import { RemoteConfigFeatureService } from './services/remote-config-feature.service';
import { RouteFocusService } from './services/route-focus.service';
import { ThemeService } from './services/theme.service';
import { translocoProviders } from './transloco.providers';

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
 * Firebase web SDK: App Check (reCAPTCHA Enterprise), Performance, Analytics (GA4).
 * Order: App → App Check → Performance → Analytics (all use default `getApp()`).
 */
function buildFirebaseClientProviders(): readonly EnvironmentProviders[] {
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

  providers.push(providePerformance(() => getPerformance()));

  if (isFirebaseAnalyticsConfigured()) {
    providers.push(provideAnalytics(() => getAnalytics()));
  }

  return providers;
}

function bootstrapShell(): void {
  inject(RouteFocusService);
  inject(ThemeService).initialize();
  inject(ElectionPackService).loadFromAssets();
}

function syncFirebaseAnalyticsConsent(): void {
  inject(Analytics, { optional: true });
  inject(PrivacyConsentService).syncMeasurementAfterAnalyticsReady();
}

function bootstrapRemoteConfig(): void {
  void inject(RemoteConfigFeatureService).initializeWhenFirebaseReady();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    ...buildFirebaseClientProviders(),
    ...translocoProviders(),
    provideAppInitializer(bootstrapShell),
    provideAppInitializer(syncFirebaseAnalyticsConsent),
    provideAppInitializer(bootstrapRemoteConfig),
  ],
};
