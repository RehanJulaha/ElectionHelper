import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

interface ThemeFile {
  readonly light: Readonly<Record<string, string>>;
  readonly dark: Readonly<Record<string, string>>;
}

/**
 * Applies theme tokens via {@link CSSStyleSheet} and `adoptedStyleSheets` so CSP
 * does not require `style-src 'unsafe-inline'` for `:root` variables (unlike
 * `element.style.setProperty`, which counts as an inline style).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);
  private readonly themeData = signal<ThemeFile | null>(null);
  private readonly modeState = signal<ThemeMode>('light');
  private themeVarsSheet: CSSStyleSheet | null = null;

  readonly mode = this.modeState.asReadonly();
  readonly loaded = signal(false);

  initialize(): void {
    this.http.get<ThemeFile>('/assets/themes/theme.json').subscribe({
      next: (data): void => {
        this.themeData.set(data);
        this.modeState.set('light');
        this.applyVariables(data.light);
        document.documentElement.setAttribute('data-theme', 'light');
        this.loaded.set(true);
      },
      error: (): void => {
        this.loaded.set(true);
      },
    });
  }

  toggleMode(): void {
    const data = this.themeData();
    if (!data) {
      return;
    }
    const next: ThemeMode = this.modeState() === 'light' ? 'dark' : 'light';
    this.modeState.set(next);
    this.applyVariables(next === 'light' ? data.light : data.dark);
    document.documentElement.setAttribute('data-theme', next);
  }

  private getOrCreateThemeSheet(): CSSStyleSheet {
    if (this.themeVarsSheet) {
      return this.themeVarsSheet;
    }
    const sheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    this.themeVarsSheet = sheet;
    return sheet;
  }

  private applyVariables(vars: Readonly<Record<string, string>>): void {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(vars)) {
      if (!/^--[\w-]+$/.test(key)) {
        continue;
      }
      parts.push(`${key}:${this.sanitizeCssDeclarationValue(value)}`);
    }
    const sheet = this.getOrCreateThemeSheet();
    sheet.replaceSync(`:root { ${parts.join(';')} }`);
  }

  /** Strip characters that could break out of a declaration if `theme.json` were tampered with. */
  private sanitizeCssDeclarationValue(value: string): string {
    const v = value.replace(/[\n\r;{}\\]/g, '').trim();
    return v.length > 0 ? v : 'unset';
  }
}
