import { ElectionPackSchema, type ElectionPack } from './schema';

export type SafeParseElectionPackResult = ReturnType<typeof ElectionPackSchema.safeParse>;

export function parseElectionPack(input: unknown): ElectionPack {
  return ElectionPackSchema.parse(input);
}

export function safeParseElectionPack(input: unknown): SafeParseElectionPackResult {
  return ElectionPackSchema.safeParse(input);
}
