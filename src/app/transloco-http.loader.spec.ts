import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TranslocoHttpLoader } from './transloco-http.loader';

describe('TranslocoHttpLoader', () => {
  let loader: TranslocoHttpLoader;
  let http: HttpTestingController;

  beforeEach(() => {
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

  it('requests en json', (done) => {
    loader.getTranslation('en').subscribe((t) => {
      expect(t).toBeTruthy();
      done();
    });
    http.expectOne('/assets/i18n/en.json').flush({ a: 1 });
  });
  it('requests hi json', (done) => {
    loader.getTranslation('hi').subscribe((t) => {
      expect(t).toBeTruthy();
      done();
    });
    http.expectOne('/assets/i18n/hi.json').flush({ b: 2 });
  });
});
