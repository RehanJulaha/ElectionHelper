import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RouteFocusService } from './route-focus.service';

describe('RouteFocusService', () => {
  let events$: Subject<unknown>;
  let routerStub: Pick<Router, 'events'>;

  beforeEach((): void => {
    events$ = new Subject();
    routerStub = { events: events$.asObservable() } as Pick<Router, 'events'>;
    const main = document.createElement('main');
    main.id = 'main';
    main.tabIndex = -1;
    document.body.appendChild(main);
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: Router, useValue: routerStub },
        RouteFocusService,
      ],
    });
  });

  afterEach((): void => {
    document.getElementById('main')?.remove();
  });

  it('does not focus main on first home navigation', async (): Promise<void> => {
    TestBed.inject(RouteFocusService);
    events$.next(new NavigationEnd(1, '/', '/'));
    await Promise.resolve();
    expect(document.activeElement === document.getElementById('main')).toBe(false);
  });

  it('focuses main after navigation to a non-home route', async (): Promise<void> => {
    TestBed.inject(RouteFocusService);
    events$.next(new NavigationEnd(1, '/', '/'));
    events$.next(new NavigationEnd(2, '/glossary', '/glossary'));
    await Promise.resolve();
    expect(document.activeElement).toBe(document.getElementById('main'));
  });
});
