import { describe, expect, it } from 'vitest';
import type { GlossaryEntry } from '../../../src/lib/election/schema';
import {
  filterGlossaryByQuery,
  findGlossaryEntry,
  glossaryIds,
  uniqueGlossaryIds,
} from '../../../src/lib/election/glossary';

const entries: GlossaryEntry[] = [
  { id: 'a', termKey: 't.a', definitionKey: 'd.a' },
  { id: 'b', termKey: 't.b', definitionKey: 'd.b' },
];

describe('findGlossaryEntry', () => {
  it('finds by id', () => {
    expect(findGlossaryEntry(entries, 'b')?.id).toBe('b');
  });
  it('undefined when missing', () => {
    expect(findGlossaryEntry(entries, 'z')).toBeUndefined();
  });
});

describe('glossaryIds', () => {
  it('maps ids', () => {
    expect(glossaryIds(entries)).toEqual(['a', 'b']);
  });
});

describe('uniqueGlossaryIds', () => {
  it('true when unique', () => {
    expect(uniqueGlossaryIds(entries)).toBe(true);
  });
  it('false on duplicate', () => {
    const dup: GlossaryEntry[] = [
      { id: 'x', termKey: '1', definitionKey: '2' },
      { id: 'x', termKey: '3', definitionKey: '4' },
    ];
    expect(uniqueGlossaryIds(dup)).toBe(false);
  });
});

describe('filterGlossaryByQuery', () => {
  const resolve = (e: GlossaryEntry) => (e.id === 'a' ? 'NOTA' : 'EPIC');
  it('returns all when query empty', () => {
    expect(filterGlossaryByQuery(entries, '  ', resolve).length).toBe(2);
  });
  it('filters case insensitive', () => {
    expect(filterGlossaryByQuery(entries, 'nota', resolve).length).toBe(1);
  });
  it('returns none when no match', () => {
    expect(filterGlossaryByQuery(entries, 'zzz', resolve).length).toBe(0);
  });
});
