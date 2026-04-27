import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Moves keyboard focus to the main landmark after in-app navigations so
 * assistive technology and keyboard users get a sensible focus target (WCAG 2.4.3).
 * Skips programmatic focus on the first navigation to the home route so the skip
 * link remains the first tab stop on a cold load to `/`.
 */
@Injectable({ providedIn: 'root' })
export class RouteFocusService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private isFirstNavigation = true;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects.split('?')[0] ?? '';
        const isHome = url === '/' || url === '';
        if (this.isFirstNavigation && isHome) {
          this.isFirstNavigation = false;
          return;
        }
        this.isFirstNavigation = false;
        queueMicrotask(() => {
          document.getElementById('main')?.focus({ preventScroll: true });
        });
      });
  }
}
