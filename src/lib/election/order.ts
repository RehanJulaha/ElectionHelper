import type { ElectionPhase } from './schema';

/**
 * Returns phases sorted ascending by their `order` field (immutable copy).
 *
 * @param phases - Phase list from a pack.
 */
export function sortPhasesByOrder(phases: readonly ElectionPhase[]): ElectionPhase[] {
  return [...phases].sort((a, b) => a.order - b.order);
}

/**
 * Looks up a phase by id.
 *
 * @param phases - Phase list from a pack.
 * @param id - Phase id.
 */
export function phaseById(phases: readonly ElectionPhase[], id: string): ElectionPhase | undefined {
  return phases.find((p) => p.id === id);
}

/**
 * Id of the phase after `currentId` in `order`, or `null` if none.
 *
 * @param phases - Phase list from a pack.
 * @param currentId - Current phase id.
 */
export function nextPhaseId(phases: readonly ElectionPhase[], currentId: string): string | null {
  const sorted = sortPhasesByOrder(phases);
  const idx = sorted.findIndex((p) => p.id === currentId);
  if (idx < 0 || idx >= sorted.length - 1) {
    return null;
  }
  return sorted[idx + 1]!.id;
}

/**
 * Id of the phase before `currentId` in `order`, or `null` if none.
 *
 * @param phases - Phase list from a pack.
 * @param currentId - Current phase id.
 */
export function previousPhaseId(phases: readonly ElectionPhase[], currentId: string): string | null {
  const sorted = sortPhasesByOrder(phases);
  const idx = sorted.findIndex((p) => p.id === currentId);
  if (idx <= 0) {
    return null;
  }
  return sorted[idx - 1]!.id;
}

/**
 * True when sorted phases have contiguous `order` values starting at 0.
 *
 * @param phases - Phase list from a pack.
 */
export function isOrderedContiguous(phases: readonly ElectionPhase[]): boolean {
  const sorted = sortPhasesByOrder(phases);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i]!.order !== i) {
      return false;
    }
  }
  return true;
}
