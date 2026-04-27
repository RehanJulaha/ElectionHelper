import { ElectionPackSchema, type ElectionPack } from './schema';

/** Result type of {@link ElectionPackSchema.safeParse}. */
export type SafeParseElectionPackResult = ReturnType<typeof ElectionPackSchema.safeParse>;

/**
 * Parses unknown JSON into a validated {@link ElectionPack}.
 *
 * @param input - Raw value (typically from HTTP or `JSON.parse`).
 * @returns A validated election pack.
 * @throws If the input does not satisfy {@link ElectionPackSchema}.
 */
export function parseElectionPack(input: unknown): ElectionPack {
  return ElectionPackSchema.parse(input);
}

/**
 * Parses unknown JSON without throwing; use `success` / `data` / `error` on the
 * result to branch (see {@link SafeParseElectionPackResult}).
 *
 * @param input - Raw value to validate.
 * @returns Zod safe-parse result for {@link ElectionPack}.
 */
export function safeParseElectionPack(input: unknown): SafeParseElectionPackResult {
  return ElectionPackSchema.safeParse(input);
}
