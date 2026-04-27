import { describe, expect, it } from 'vitest';
import raw from '../../../src/assets/content/india-lok-sabha.json';
import { parseElectionPack } from '../../../src/lib/election/parse';
import { allSourcesAreEci } from '../../../src/lib/election/sources';
import { isOrderedContiguous, sortPhasesByOrder } from '../../../src/lib/election/order';
import { uniqueGlossaryIds } from '../../../src/lib/election/glossary';

describe('india-lok-sabha.json pack', () => {
  const pack = parseElectionPack(raw);

  it('parses without error', () => {
    expect(pack.phases.length).toBeGreaterThan(0);
  });
  it('has expected scope key', () => {
    expect(pack.scopeKey).toBe('app.scope.lokSabha');
  });
  it('has content version', () => {
    expect(pack.contentVersion.length).toBeGreaterThan(0);
  });
  it('has last reviewed', () => {
    expect(pack.lastReviewed.length).toBeGreaterThan(0);
  });
  it('phases contiguous order', () => {
    expect(isOrderedContiguous(pack.phases)).toBe(true);
  });
  it('all sources are ECI hosts', () => {
    for (const ph of pack.phases) {
      expect(allSourcesAreEci(ph.sources)).toBe(true);
    }
  });
  it('glossary ids unique', () => {
    expect(uniqueGlossaryIds(pack.glossary)).toBe(true);
  });
  it('sorted phases length matches', () => {
    expect(sortPhasesByOrder(pack.phases).length).toBe(pack.phases.length);
  });
  it('has at least 8 phases', () => {
    expect(pack.phases.length).toBeGreaterThanOrEqual(8);
  });
  it('has at least 8 glossary entries', () => {
    expect(pack.glossary.length).toBeGreaterThanOrEqual(8);
  });
});
