import { z } from 'zod';

function isEciHost(url: string): boolean {
  try {
    const u = new URL(url);
    const h = u.hostname;
    return h === 'eci.gov.in' || h === 'www.eci.gov.in' || h.endsWith('.eci.gov.in');
  } catch {
    return false;
  }
}

export const ElectionSourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});

export const PhaseBodyKeysSchema = z.object({
  voter: z.string().min(1),
  candidate: z.string().min(1),
  observer: z.string().min(1),
});

export const ElectionPhaseSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().nonnegative(),
    titleKey: z.string().min(1),
    bodyKeys: PhaseBodyKeysSchema,
    sources: z.array(ElectionSourceSchema).min(1).max(5),
  })
  .superRefine((phase, ctx) => {
    for (let i = 0; i < phase.sources.length; i++) {
      if (!isEciHost(phase.sources[i]!.url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'sources_must_use_eci_hosts',
          path: ['sources', i, 'url'],
        });
      }
    }
  });

export const GlossaryEntrySchema = z.object({
  id: z.string().min(1),
  termKey: z.string().min(1),
  definitionKey: z.string().min(1),
});

export const ElectionPackSchema = z.object({
  scopeKey: z.string().min(1),
  contentVersion: z.string().min(1),
  lastReviewed: z.string().min(1),
  disclaimerKey: z.string().min(1),
  phases: z.array(ElectionPhaseSchema).min(1),
  glossary: z.array(GlossaryEntrySchema).min(1),
});

export type ElectionPack = z.infer<typeof ElectionPackSchema>;
export type ElectionPhase = z.infer<typeof ElectionPhaseSchema>;
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;
export type ElectionSource = z.infer<typeof ElectionSourceSchema>;
