import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ThemeService } from './theme.service';
import themeJson from '../../assets/themes/theme.json';

describe('ThemeService', () => {
  let service: ThemeService;
  let http: HttpTestingController;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ThemeService,
      ],
    });
    service = TestBed.inject(ThemeService);
    http = TestBed.inject(HttpTestingController);
  });

  it('initial mode light', (): void => {
    expect(service.mode()).toBe('light');
  });
  it('loads theme json', (): void => {
    service.initialize();
    http.expectOne('/assets/themes/theme.json').flush(themeJson);
    expect(service.loaded()).toBe(true);
  });
  it('toggle switches mode', (): void => {
    service.initialize();
    http.expectOne('/assets/themes/theme.json').flush(themeJson);
    service.toggleMode();
    expect(service.mode()).toBe('dark');
    service.toggleMode();
    expect(service.mode()).toBe('light');
  });
  it('toggle no-op when theme missing', (): void => {
    service.initialize();
    http.expectOne('/assets/themes/theme.json').error(new ProgressEvent('error'));
    service.toggleMode();
    expect(service.mode()).toBe('light');
  });
});
