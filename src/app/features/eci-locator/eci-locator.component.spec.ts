import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { EciLocatorComponent } from './eci-locator.component';
import en from '../../../assets/i18n/en.json';
import hi from '../../../assets/i18n/hi.json';

describe('EciLocatorComponent', () => {
  let fixture: ComponentFixture<EciLocatorComponent>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [
        EciLocatorComponent,
        TranslocoTestingModule.forRoot({
          langs: { en, hi },
          translocoConfig: { availableLangs: ['en', 'hi'], defaultLang: 'en' },
        }),
      ],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(EciLocatorComponent);
    fixture.detectChanges();
  });

  it('creates', (): void => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('onPlaceChange updates selected id when valid', (): void => {
    type LocHarness = {
      onPlaceChange(ev: Event): void;
      selectedPlaceId: () => string;
    };
    const cmp = fixture.componentInstance as unknown as LocHarness;
    const select = document.createElement('select');
    const opt = document.createElement('option');
    opt.value = 'ceo_delhi_example';
    select.appendChild(opt);
    select.value = 'ceo_delhi_example';
    cmp.onPlaceChange({ target: select } as unknown as Event);
    expect(cmp.selectedPlaceId()).toBe('ceo_delhi_example');
  });
});
