import type { GlossaryEntry } from './schema';

export function findGlossaryEntry(entries: readonly GlossaryEntry[], id: string): GlossaryEntry | undefined {
  return entries.find((e) => e.id === id);
}

export function glossaryIds(entries: readonly GlossaryEntry[]): string[] {
  return entries.map((e) => e.id);
}

export function filterGlossaryByQuery(
  entries: readonly GlossaryEntry[],
  query: string,
  resolveTerm: (entry: GlossaryEntry) => string
): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return [...entries];
  }
  return entries.filter((e) => resolveTerm(e).toLowerCase().includes(q));
}

export function uniqueGlossaryIds(entries: readonly GlossaryEntry[]): boolean {
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.id)) {
      return false;
    }
    seen.add(e.id);
  }
  return true;
}
