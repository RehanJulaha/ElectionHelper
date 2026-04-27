import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

const MAX_PROMPT = 2000;

export const assistantAsk = onCall(
  { region: 'asia-south1', enforceAppCheck: false },
  async (
    request: CallableRequest
  ): Promise<{ readonly reply: string; readonly citations: readonly string[] }> => {
    const prompt = typeof request.data?.prompt === 'string' ? request.data.prompt : '';
    if (prompt.length === 0) {
      throw new HttpsError('invalid-argument', 'prompt_required');
    }
    if (prompt.length > MAX_PROMPT) {
      throw new HttpsError('invalid-argument', 'prompt_too_long');
    }
    logger.info('assistant_stub', { len: prompt.length });
    return {
      reply:
        'Educational stub: verify every fact on https://www.eci.gov.in/ . Vertex Gemini wiring belongs behind this function with Secret Manager and allowlisted models.',
      citations: ['https://www.eci.gov.in/voter-education/'],
    };
  }
);
