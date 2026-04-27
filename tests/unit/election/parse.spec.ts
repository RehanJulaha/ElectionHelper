import { describe, expect, it } from 'vitest';
import { parseElectionPack, safeParseElectionPack } from '../../../src/lib/election/parse';

const minimalPhase = {
  id: 'p1',
  order: 0,
  titleKey: 't',
  bodyKeys: { voter: 'a', candidate: 'b', observer: 'c' },
  sources: [{ title: 'ECI', url: 'https://www.eci.gov.in/' }],
};

const minimalPack = {
  scopeKey: 'app.scope',
  contentVersion: '1',
  lastReviewed: '2026-01-01',
  disclaimerKey: 'd',
  phases: [minimalPhase],
  glossary: [{ id: 'g1', termKey: 't', definitionKey: 'd' }],
};

describe('parseElectionPack', () => {
  it('parses valid pack', () => {
    const p = parseElectionPack(minimalPack);
    expect(p.phases).toHaveLength(1);
  });
  it('throws on missing phases', () => {
    expect(() =>
      parseElectionPack({
        ...minimalPack,
        phases: [],
      })
    ).toThrow();
  });
  it('throws on missing glossary', () => {
    expect(() =>
      parseElectionPack({
        ...minimalPack,
        glossary: [],
      })
    ).toThrow();
  });
  it('throws on invalid url', () => {
    expect(() =>
      parseElectionPack({
        ...minimalPack,
        phases: [
          {
            ...minimalPhase,
            sources: [{ title: 'x', url: 'https://evil.com/' }],
          },
        ],
      })
    ).toThrow();
  });
  it('throws on missing body key', () => {
    expect(() =>
      parseElectionPack({
        ...minimalPack,
        phases: [
          {
            ...minimalPhase,
            bodyKeys: { voter: 'a', candidate: 'b', observer: '' },
          },
        ],
      })
    ).toThrow();
  });
});

describe('safeParseElectionPack', () => {
  it('success on valid', () => {
    const r = safeParseElectionPack(minimalPack);
    expect(r.success).toBe(true);
  });
  it('failure on invalid', () => {
    const r = safeParseElectionPack(null);
    expect(r.success).toBe(false);
  });
  it('failure on wrong type phases', () => {
    const r = safeParseElectionPack({ ...minimalPack, phases: 'bad' });
    expect(r.success).toBe(false);
  });
  it('failure on wrong type glossary', () => {
    const r = safeParseElectionPack({ ...minimalPack, glossary: {} });
    expect(r.success).toBe(false);
  });
  it('failure when scopeKey empty', () => {
    const r = safeParseElectionPack({ ...minimalPack, scopeKey: '' });
    expect(r.success).toBe(false);
  });
  it('failure when contentVersion empty', () => {
    const r = safeParseElectionPack({ ...minimalPack, contentVersion: '' });
    expect(r.success).toBe(false);
  });
  it('failure when lastReviewed empty', () => {
    const r = safeParseElectionPack({ ...minimalPack, lastReviewed: '' });
    expect(r.success).toBe(false);
  });
  it('failure when disclaimerKey empty', () => {
    const r = safeParseElectionPack({ ...minimalPack, disclaimerKey: '' });
    expect(r.success).toBe(false);
  });
  it('failure when phase id empty', () => {
    const r = safeParseElectionPack({
      ...minimalPack,
      phases: [{ ...minimalPhase, id: '' }],
    });
    expect(r.success).toBe(false);
  });
  it('failure when phase order negative', () => {
    const r = safeParseElectionPack({
      ...minimalPack,
      phases: [{ ...minimalPhase, order: -1 }],
    });
    expect(r.success).toBe(false);
  });
  it('failure when sources empty', () => {
    const r = safeParseElectionPack({
      ...minimalPack,
      phases: [{ ...minimalPhase, sources: [] }],
    });
    expect(r.success).toBe(false);
  });
  it('failure when glossary id empty', () => {
    const r = safeParseElectionPack({
      ...minimalPack,
      glossary: [{ id: '', termKey: 't', definitionKey: 'd' }],
    });
    expect(r.success).toBe(false);
  });
  it('failure when too many sources', () => {
    const sources = Array.from({ length: 6 }, (_, i) => ({
      title: `s${i}`,
      url: 'https://www.eci.gov.in/',
    }));
    const r = safeParseElectionPack({
      ...minimalPack,
      phases: [{ ...minimalPhase, sources }],
    });
    expect(r.success).toBe(false);
  });
});
