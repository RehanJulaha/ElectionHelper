import { describe, expect, it } from 'vitest';
import { isElectionRole, parseRole, ROLES } from '../../../src/lib/election/roles';

describe('ROLES', () => {
  it('exports three roles', () => {
    expect(ROLES).toHaveLength(3);
  });
  it('includes voter', () => {
    expect(ROLES).toContain('voter');
  });
  it('includes candidate', () => {
    expect(ROLES).toContain('candidate');
  });
  it('includes observer', () => {
    expect(ROLES).toContain('observer');
  });
});

describe('isElectionRole', () => {
  it('accepts voter', () => {
    expect(isElectionRole('voter')).toBe(true);
  });
  it('accepts candidate', () => {
    expect(isElectionRole('candidate')).toBe(true);
  });
  it('accepts observer', () => {
    expect(isElectionRole('observer')).toBe(true);
  });
  it('rejects admin string', () => {
    expect(isElectionRole('admin')).toBe(false);
  });
  it('rejects empty string', () => {
    expect(isElectionRole('')).toBe(false);
  });
  it('rejects number', () => {
    expect(isElectionRole(1)).toBe(false);
  });
  it('rejects null', () => {
    expect(isElectionRole(null)).toBe(false);
  });
  it('rejects undefined', () => {
    expect(isElectionRole(undefined)).toBe(false);
  });
  it('rejects object', () => {
    expect(isElectionRole({})).toBe(false);
  });
  it('rejects VOTER uppercase', () => {
    expect(isElectionRole('VOTER')).toBe(false);
  });
});

describe('parseRole', () => {
  it('parses voter', () => {
    expect(parseRole('voter')).toBe('voter');
  });
  it('parses candidate', () => {
    expect(parseRole('candidate')).toBe('candidate');
  });
  it('parses observer', () => {
    expect(parseRole('observer')).toBe('observer');
  });
  it('returns null for invalid', () => {
    expect(parseRole('x')).toBeNull();
  });
});
