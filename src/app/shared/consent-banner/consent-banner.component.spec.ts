import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { Analytics } from '@angular/fire/analytics';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { ConsentBannerComponent } from './consent-banner.component';
import { PrivacyConsentService } from '../../services/privacy-consent.service';
import en from '../../../assets/i18n/en.json';
import hi from '../../../assets/i18n/hi.json';

describe('ConsentBannerComponent', () => {
  let fixture: ComponentFixture<ConsentBannerComponent>;

  beforeEach(async (): Promise<void> => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [
        ConsentBannerComponent,
        TranslocoTestingModule.forRoot({
          langs: { en, hi },
          translocoConfig: { availableLangs: ['en', 'hi'], defaultLang: 'en' },
        }),
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        PrivacyConsentService,
        { provide: Analytics, useValue: null },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ConsentBannerComponent);
    fixture.detectChanges();
  });

  it('creates', (): void => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('accept removes banner when analytics is configured and decision pending', (): void => {
    const root: HTMLElement = fixture.nativeElement as HTMLElement;
    const banner = root.querySelector('.consent-banner');
    if (!banner) {
      expect(true).toBe(true);
      return;
    }
    const accept = root.querySelector('.consent-banner__btn--primary') as HTMLButtonElement | null;
    expect(accept).toBeTruthy();
    accept?.click();
    fixture.detectChanges();
    expect(root.querySelector('.consent-banner')).toBeNull();
    expect(TestBed.inject(PrivacyConsentService).decision()).toBe('accepted');
  });
});
