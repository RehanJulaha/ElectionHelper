import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { ThemeService } from './services/theme.service';
import { AnalyticsEventsService } from './services/analytics-events.service';
import { ConsentBannerComponent } from './shared/consent-banner/consent-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe, ConsentBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly analyticsEvents = inject(AnalyticsEventsService);
  protected readonly theme = inject(ThemeService);

  readonly uiLang = signal<'en' | 'hi'>(this.transloco.getActiveLang() as 'en' | 'hi');

  constructor() {
    effect((): void => {
      document.documentElement.lang = this.uiLang();
    });
    effect((): void => {
      document.documentElement.setAttribute('data-theme', this.theme.mode());
    });
  }

  setLang(lang: 'en' | 'hi'): void {
    const prev = this.transloco.getActiveLang();
    this.transloco.setActiveLang(lang);
    this.uiLang.set(lang);
    if (prev !== lang) {
      this.analyticsEvents.logLanguageChanged(lang);
    }
  }

  toggleTheme(): void {
    this.theme.toggleMode();
  }
}
