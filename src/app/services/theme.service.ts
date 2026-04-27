import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

interface ThemeFile {
  readonly light: Readonly<Record<string, string>>;
  readonly dark: Readonly<Record<string, string>>;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);
  private readonly themeData = signal<ThemeFile | null>(null);
  private readonly modeState = signal<ThemeMode>('light');

  readonly mode = this.modeState.asReadonly();
  readonly loaded = signal(false);

  initialize(): void {
    this.http.get<ThemeFile>('/assets/themes/theme.json').subscribe({
      next: (data) => {
        this.themeData.set(data);
        this.modeState.set('light');
        this.applyVariables(data.light);
        document.documentElement.setAttribute('data-theme', 'light');
        this.loaded.set(true);
      },
      error: () => {
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

  private applyVariables(vars: Readonly<Record<string, string>>): void {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
  }
}
