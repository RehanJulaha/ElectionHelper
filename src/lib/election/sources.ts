import type { ElectionSource } from './schema';

const ECI_HOST = 'eci.gov.in';

export function isEciUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === ECI_HOST || u.hostname.endsWith(`.${ECI_HOST}`);
  } catch {
    return false;
  }
}

export function allSourcesAreEci(sources: readonly ElectionSource[]): boolean {
  return sources.every((s) => isEciUrl(s.url));
}

export function sourceTitlesUnique(sources: readonly ElectionSource[]): boolean {
  const t = new Set(sources.map((s) => s.title));
  return t.size === sources.length;
}
