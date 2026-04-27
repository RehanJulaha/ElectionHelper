import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { Analytics } from '@angular/fire/analytics';
import { routes } from './app.routes';
import { buildFirebaseClientProviders } from './firebase/firebase.providers';
import { ElectionPackService } from './services/election-pack.service';
import { PrivacyConsentService } from './services/privacy-consent.service';
import { RemoteConfigFeatureService } from './services/remote-config-feature.service';
import { RouteFocusService } from './services/route-focus.service';
import { ThemeService } from './services/theme.service';
import { translocoProviders } from './transloco.providers';

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
