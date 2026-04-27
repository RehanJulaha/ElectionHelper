import { describe, expect, it } from 'vitest';
import type { ElectionSource } from '../../../src/lib/election/schema';
import { allSourcesAreEci, isEciUrl, sourceTitlesUnique } from '../../../src/lib/election/sources';

describe('isEciUrl', () => {
  it('accepts www host', () => {
    expect(isEciUrl('https://www.eci.gov.in/voter-education/')).toBe(true);
  });
  it('accepts bare host', () => {
    expect(isEciUrl('https://eci.gov.in/evm/')).toBe(true);
  });
  it('rejects other host', () => {
    expect(isEciUrl('https://example.com/')).toBe(false);
  });
  it('rejects malformed', () => {
    expect(isEciUrl('not-a-url')).toBe(false);
  });
});

describe('allSourcesAreEci', () => {
  const ok: ElectionSource[] = [{ title: 'ECI', url: 'https://www.eci.gov.in/' }];
  it('true for eci only', () => {
    expect(allSourcesAreEci(ok)).toBe(true);
  });
  it('false if one bad', () => {
    const mixed: ElectionSource[] = [...ok, { title: 'x', url: 'https://example.com/' }];
    expect(allSourcesAreEci(mixed)).toBe(false);
  });
});

describe('sourceTitlesUnique', () => {
  it('true when unique titles', () => {
    const s: ElectionSource[] = [
      { title: 'A', url: 'https://www.eci.gov.in/' },
      { title: 'B', url: 'https://eci.gov.in/' },
    ];
    expect(sourceTitlesUnique(s)).toBe(true);
  });
  it('false on duplicate titles', () => {
    const s: ElectionSource[] = [
      { title: 'A', url: 'https://www.eci.gov.in/' },
      { title: 'A', url: 'https://eci.gov.in/' },
    ];
    expect(sourceTitlesUnique(s)).toBe(false);
  });
});
