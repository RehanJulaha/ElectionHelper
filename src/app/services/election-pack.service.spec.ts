import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ElectionPackService } from './election-pack.service';
import packJson from '../../assets/content/india-lok-sabha.json';

describe('ElectionPackService', () => {
  let service: ElectionPackService;
  let http: HttpTestingController;

  beforeEach((): void => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ElectionPackService,
      ],
    });
    service = TestBed.inject(ElectionPackService);
    http = TestBed.inject(HttpTestingController);
  });

  it('starts loading true', (): void => {
    expect(service.loading()).toBe(true);
  });

  it('parses pack from assets', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    expect(service.loading()).toBe(false);
    expect(service.pack()?.contentVersion).toBeDefined();
  });

  it('sets error on bad json', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush({});
    expect(service.error()).toBe('parse_failed');
  });

  it('sets error on network failure when no cache', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    expect(service.error()).toBe('network');
    expect(service.pack()).toBeNull();
  });

  it('retries then succeeds', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    expect(service.pack()?.contentVersion).toBeDefined();
    expect(service.error()).toBeNull();
  });

  it('clears error on success after failure', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    expect(service.error()).toBeNull();
  });

  it('serves cached pack when all network attempts fail', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    expect(service.pack()).toBeTruthy();
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    http.expectOne('/assets/content/india-lok-sabha.json').error(new ProgressEvent('error'));
    expect(service.pack()?.contentVersion).toBeDefined();
    expect(service.error()).toBeNull();
  });

  it('pack has phases', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    expect(service.pack()?.phases.length).toBeGreaterThan(0);
  });

  it('pack has glossary', (): void => {
    service.loadFromAssets();
    http.expectOne('/assets/content/india-lok-sabha.json').flush(packJson);
    expect(service.pack()?.glossary.length).toBeGreaterThan(0);
  });
});
