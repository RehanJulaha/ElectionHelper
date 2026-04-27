import type { GlossaryEntry } from './schema';

/**
 * Finds a glossary entry by stable id.
 *
 * @param entries - Glossary rows from a pack.
 * @param id - Entry id to match.
 * @returns The entry, or `undefined` if not found.
 */
export function findGlossaryEntry(entries: readonly GlossaryEntry[], id: string): GlossaryEntry | undefined {
  return entries.find((e) => e.id === id);
}

/**
 * Lists all glossary entry ids in order.
 *
 * @param entries - Glossary rows from a pack.
 */
export function glossaryIds(entries: readonly GlossaryEntry[]): string[] {
  return entries.map((e) => e.id);
}

/**
 * Filters glossary entries by a case-insensitive substring match on the resolved term.
 *
 * @param entries - Glossary rows from a pack.
 * @param query - User search string (trimmed, lowercased internally).
 * @param resolveTerm - Maps an entry to display text for the current language.
 * @returns Matching entries, or a copy of all entries when `query` is empty.
 */
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

/**
 * True when every glossary id appears at most once.
 *
 * @param entries - Glossary rows from a pack.
 */
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
