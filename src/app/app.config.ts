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
import { routes } from './app.routes';
import { ElectionPackService } from './services/election-pack.service';
import { FirebaseBootstrapService } from './services/firebase-bootstrap.service';
import { RouteFocusService } from './services/route-focus.service';
import { ThemeService } from './services/theme.service';
import { translocoProviders } from './transloco.providers';

function bootstrapShell(): void {
  inject(RouteFocusService);
  inject(ThemeService).initialize();
  inject(ElectionPackService).loadFromAssets();
}

function bootstrapFirebase(): Promise<void> {
  return inject(FirebaseBootstrapService).initializeWhenConfigured();
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
    translocoProviders(),
    provideAppInitializer(bootstrapShell),
    provideAppInitializer(bootstrapFirebase),
  ],
};
