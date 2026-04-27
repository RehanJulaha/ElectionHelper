import { describe, expect, it } from 'vitest';
import type { ElectionPhase } from '../../../src/lib/election/schema';
import {
  isOrderedContiguous,
  nextPhaseId,
  phaseById,
  previousPhaseId,
  sortPhasesByOrder,
} from '../../../src/lib/election/order';

const mk = (id: string, order: number): ElectionPhase => ({
  id,
  order,
  titleKey: `k.${id}.t`,
  bodyKeys: { voter: 'a', candidate: 'b', observer: 'c' },
  sources: [{ title: 'ECI', url: 'https://www.eci.gov.in/voter-education/' }],
});

describe('sortPhasesByOrder', () => {
  it('orders by order ascending', () => {
    const p = [mk('b', 2), mk('a', 0), mk('c', 1)];
    const s = sortPhasesByOrder(p);
    expect(s.map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });
  it('does not mutate original', () => {
    const p = [mk('b', 1), mk('a', 0)];
    sortPhasesByOrder(p);
    expect(p[0]!.id).toBe('b');
  });
  it('handles single', () => {
    expect(sortPhasesByOrder([mk('x', 0)]).length).toBe(1);
  });
  it('stable for equal order by sort stability', () => {
    const p = [mk('a', 0), mk('b', 0)];
    const s = sortPhasesByOrder(p);
    expect(s.length).toBe(2);
  });
});

describe('phaseById', () => {
  it('finds existing', () => {
    const p = [mk('a', 0), mk('b', 1)];
    expect(phaseById(p, 'b')?.id).toBe('b');
  });
  it('returns undefined when missing', () => {
    expect(phaseById([mk('a', 0)], 'z')).toBeUndefined();
  });
});

describe('nextPhaseId', () => {
  const chain = [mk('a', 0), mk('b', 1), mk('c', 2)];
  it('returns next id', () => {
    expect(nextPhaseId(chain, 'a')).toBe('b');
  });
  it('returns null at end', () => {
    expect(nextPhaseId(chain, 'c')).toBeNull();
  });
  it('returns null for unknown', () => {
    expect(nextPhaseId(chain, 'z')).toBeNull();
  });
});

describe('previousPhaseId', () => {
  const chain = [mk('a', 0), mk('b', 1), mk('c', 2)];
  it('returns previous id', () => {
    expect(previousPhaseId(chain, 'c')).toBe('b');
  });
  it('returns null at start', () => {
    expect(previousPhaseId(chain, 'a')).toBeNull();
  });
  it('returns null for unknown', () => {
    expect(previousPhaseId(chain, 'z')).toBeNull();
  });
});

describe('isOrderedContiguous', () => {
  it('true when 0..n-1', () => {
    expect(isOrderedContiguous([mk('a', 0), mk('b', 1)])).toBe(true);
  });
  it('false when gap', () => {
    expect(isOrderedContiguous([mk('a', 0), mk('b', 2)])).toBe(false);
  });
  it('false when duplicate order', () => {
    expect(isOrderedContiguous([mk('a', 0), mk('b', 0)])).toBe(false);
  });
  it('true for empty', () => {
    expect(isOrderedContiguous([])).toBe(true);
  });
});
