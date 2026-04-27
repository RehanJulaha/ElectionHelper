import { isDevMode } from '@angular/core';
import { provideTransloco } from '@ngneat/transloco';
import { TranslocoHttpLoader } from './transloco-http.loader';

export function translocoProviders() {
  return provideTransloco({
    config: {
      availableLangs: ['en', 'hi'],
      defaultLang: 'en',
      fallbackLang: 'en',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader,
  });
}
