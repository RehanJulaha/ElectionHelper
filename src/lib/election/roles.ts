/** Supported audience roles for tailored phase copy. */
export const ROLES = ['voter', 'candidate', 'observer'] as const;
/** Union of {@link ROLES} literals. */
export type ElectionRole = (typeof ROLES)[number];

/**
 * Type guard for {@link ElectionRole}.
 *
 * @param value - Unknown value (e.g. from query params).
 */
export function isElectionRole(value: unknown): value is ElectionRole {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/**
 * Parses a string role; returns `null` when the value is not a known role.
 *
 * @param value - Raw role string.
 */
export function parseRole(value: string): ElectionRole | null {
  return isElectionRole(value) ? value : null;
}
