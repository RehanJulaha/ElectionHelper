import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly theme = inject(ThemeService);

  readonly uiLang = signal<'en' | 'hi'>(this.transloco.getActiveLang() as 'en' | 'hi');

  constructor() {
    effect(() => {
      document.documentElement.lang = this.uiLang();
    });
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme.mode());
    });
  }

  setLang(lang: 'en' | 'hi'): void {
    this.transloco.setActiveLang(lang);
    this.uiLang.set(lang);
  }

  toggleTheme(): void {
    this.theme.toggleMode();
  }
}
