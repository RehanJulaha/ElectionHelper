import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

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
      .subscribe((event): void => {
        const url = event.urlAfterRedirects.split('?')[0] ?? '';
        const isHome = url === '/' || url === '';
        if (this.isFirstNavigation && isHome) {
          this.isFirstNavigation = false;
          return;
        }
        this.isFirstNavigation = false;
        queueMicrotask((): void => {
          document.getElementById('main')?.focus({ preventScroll: true });
        });
      });
  }
}
