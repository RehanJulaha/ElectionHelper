import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ActiveRoleService } from './active-role.service';

describe('ActiveRoleService', () => {
  let service: ActiveRoleService;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection(), ActiveRoleService],
    });
    service = TestBed.inject(ActiveRoleService);
  });

  it('defaults voter', (): void => {
    expect(service.role()).toBe('voter');
  });
  it('sets candidate', (): void => {
    service.setRole('candidate');
    expect(service.role()).toBe('candidate');
  });
  it('sets observer', (): void => {
    service.setRole('observer');
    expect(service.role()).toBe('observer');
  });
  it('can switch back to voter', (): void => {
    service.setRole('candidate');
    service.setRole('voter');
    expect(service.role()).toBe('voter');
  });
});
