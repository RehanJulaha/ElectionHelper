import type { ElectionPhase } from './schema';

export function sortPhasesByOrder(phases: readonly ElectionPhase[]): ElectionPhase[] {
  return [...phases].sort((a, b) => a.order - b.order);
}

export function phaseById(phases: readonly ElectionPhase[], id: string): ElectionPhase | undefined {
  return phases.find((p) => p.id === id);
}

export function nextPhaseId(phases: readonly ElectionPhase[], currentId: string): string | null {
  const sorted = sortPhasesByOrder(phases);
  const idx = sorted.findIndex((p) => p.id === currentId);
  if (idx < 0 || idx >= sorted.length - 1) {
    return null;
  }
  return sorted[idx + 1]!.id;
}

export function previousPhaseId(phases: readonly ElectionPhase[], currentId: string): string | null {
  const sorted = sortPhasesByOrder(phases);
  const idx = sorted.findIndex((p) => p.id === currentId);
  if (idx <= 0) {
    return null;
  }
  return sorted[idx - 1]!.id;
}

export function isOrderedContiguous(phases: readonly ElectionPhase[]): boolean {
  const sorted = sortPhasesByOrder(phases);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i]!.order !== i) {
      return false;
    }
  }
  return true;
}
