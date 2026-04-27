import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import en from '../assets/i18n/en.json';
import hi from '../assets/i18n/hi.json';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslocoTestingModule.forRoot({
          langs: { en, hi },
          translocoConfig: { availableLangs: ['en', 'hi'], defaultLang: 'en' },
        }),
      ],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
  it('renders skip link', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.skip-link')).toBeTruthy();
  });
  it('renders title text', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Election Process Assistant');
  });
  it('has main landmark', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('main#main')).toBeTruthy();
  });
  it('setLang updates uiLang', () => {
    fixture.componentInstance.setLang('hi');
    fixture.detectChanges();
    expect(fixture.componentInstance.uiLang()).toBe('hi');
  });
});
