import { ElectionPackSchema, type ElectionPack } from './schema';

export function parseElectionPack(input: unknown): ElectionPack {
  return ElectionPackSchema.parse(input);
}

export function safeParseElectionPack(input: unknown) {
  return ElectionPackSchema.safeParse(input);
}
