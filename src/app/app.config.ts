import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';
import { ElectionPackService } from './services/election-pack.service';
import { ThemeService } from './services/theme.service';
import { translocoProviders } from './transloco.providers';

function bootstrapData(): void {
  inject(ThemeService).initialize();
  inject(ElectionPackService).loadFromAssets();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()),
    translocoProviders(),
    provideAppInitializer(bootstrapData),
  ],
};
