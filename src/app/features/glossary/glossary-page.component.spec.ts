import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { GlossaryPageComponent } from './glossary-page.component';
import { ElectionPackService } from '../../services/election-pack.service';
import en from '../../../assets/i18n/en.json';
import hi from '../../../assets/i18n/hi.json';
import packJson from '../../../assets/content/india-lok-sabha.json';

describe('GlossaryPageComponent', () => {
  let fixture: ComponentFixture<GlossaryPageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GlossaryPageComponent,
        TranslocoTestingModule.forRoot({
          langs: { en, hi },
          translocoConfig: { availableLangs: ['en', 'hi'], defaultLang: 'en' },
        }),
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ElectionPackService,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(GlossaryPageComponent);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(ElectionPackService).loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
  it('filtered lists all when query empty', () => {
    expect(fixture.componentInstance.filtered().length).toBe(10);
  });
  it('onQueryInput filters', () => {
    const input = document.createElement('input');
    input.value = 'NOTA';
    fixture.componentInstance.onQueryInput({ target: input } as unknown as Event);
    expect(fixture.componentInstance.filtered().length).toBeGreaterThan(0);
  });
  it('onQueryInput clears shows all', () => {
    const input = document.createElement('input');
    input.value = '';
    fixture.componentInstance.onQueryInput({ target: input } as unknown as Event);
    expect(fixture.componentInstance.filtered().length).toBe(10);
  });
});
