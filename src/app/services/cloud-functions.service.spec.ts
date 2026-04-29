import { TestBed } from '@angular/core/testing';
import { AppCheck } from '@angular/fire/app-check';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { CloudFunctionsService } from './cloud-functions.service';

describe('CloudFunctionsService', () => {
  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        CloudFunctionsService,
        { provide: AppCheck, useValue: null },
      ],
    });
  });

  it('exposes isConfigured as boolean', (): void => {
    const svc = TestBed.inject(CloudFunctionsService);
    expect(typeof svc.isConfigured).toBe('boolean');
  });
});
