import type { ElectionSource } from './schema';

const ECI_HOST = 'eci.gov.in';

/**
 * Whether the URL string uses an `eci.gov.in` hostname (including subdomains).
 *
 * @param url - Absolute URL string.
 */
export function isEciUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === ECI_HOST || u.hostname.endsWith(`.${ECI_HOST}`);
  } catch {
    return false;
  }
}

/**
 * True when every source URL in the list resolves to an ECI host.
 *
 * @param sources - Phase or pack sources to validate.
 */
export function allSourcesAreEci(sources: readonly ElectionSource[]): boolean {
  return sources.every((s) => isEciUrl(s.url));
}

/**
 * True when no two sources share the same title string.
 *
 * @param sources - Sources to inspect.
 */
export function sourceTitlesUnique(sources: readonly ElectionSource[]): boolean {
  const t = new Set(sources.map((s) => s.title));
  return t.size === sources.length;
}
