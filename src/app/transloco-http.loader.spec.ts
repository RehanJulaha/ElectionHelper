import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TranslocoHttpLoader } from './transloco-http.loader';

describe('TranslocoHttpLoader', () => {
  let loader: TranslocoHttpLoader;
  let http: HttpTestingController;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        TranslocoHttpLoader,
      ],
    });
    loader = TestBed.inject(TranslocoHttpLoader);
    http = TestBed.inject(HttpTestingController);
  });

  it('requests en json', (done: DoneFn): void => {
    loader.getTranslation('en').subscribe((t): void => {
      expect(t).toBeTruthy();
      done();
    });
    http.expectOne('/assets/i18n/en.json').flush({ a: 1 });
  });
  it('requests hi json', (done: DoneFn): void => {
    loader.getTranslation('hi').subscribe((t): void => {
      expect(t).toBeTruthy();
      done();
    });
    http.expectOne('/assets/i18n/hi.json').flush({ b: 2 });
  });
});
