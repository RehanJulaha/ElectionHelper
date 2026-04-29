export const ROLES = ['voter', 'candidate', 'observer'] as const;
export type ElectionRole = (typeof ROLES)[number];

export function isElectionRole(value: unknown): value is ElectionRole {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function parseRole(value: string): ElectionRole | null {
  return isElectionRole(value) ? value : null;
}
