import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { VertexAI } from '@google-cloud/vertexai';
import { google } from 'googleapis';

const MAX_PROMPT = 2000;
const MAX_TRANSLATE_CHARS = 8000;
const MAX_TRANSLATE_ITEMS = 40;
const TIMELINE_EXPORT_SPREADSHEET_ID = '1aBfhaCp4jfZpQofiwlqg7r7yvVI2TrhLDrIa7P3ZXYQ';
/**
 * Vertex AI model ids (same region as the callable).
 * Prefer current publisher ids; version-suffixed ids (e.g. …-001) are retired often and yield 404 for all models.
 * @see https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versions
 */
const GEMINI_VERTEX_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
] as const;
const VERTEX_LOCATION = 'asia-south1' as const;
const GEMINI_MAX_RETRIES_PER_MODEL = 2;
const GEMINI_RETRY_BASE_DELAY_MS = 600;

/** Gen2 callables sit behind Cloud Run; browsers need unauthenticated HTTP invoke so OPTIONS/POST reach the handler (App Check + Firebase still gate abuse). */
const CALLABLE_BASE = { region: 'asia-south1' as const, invoker: 'public' as const };

/** Secret Manager *names* only — never put key material or JSON in source (use `firebase functions:secrets:set`). */
const translateApiKey = defineSecret('GOOGLE_TRANSLATE_API_KEY');
const sheetsServiceAccountJson = defineSecret('GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON');

const RAG_CONTEXT = `You are the Election Process Assistant for India's Lok Sabha (general election) education.
Answer only using the following pack summary and general civics knowledge; if unsure, say to verify on https://www.eci.gov.in/ .
Pack summary: phases include schedule & Model Code of Conduct, nominations, scrutiny, withdrawal, campaign, polling day, counting, results declaration.
Always remind users that this is educational and official ECI/CEO channels prevail.`;

async function translateWithGoogleCloud(
  texts: readonly string[],
  target: string,
  apiKey: string
): Promise<readonly string[]> {
  const body = { q: [...texts], target, format: 'text' as const };
  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`translate_http_${res.status}`);
  }
  const json = (await res.json()) as {
    readonly data?: { readonly translations?: readonly { readonly translatedText?: string }[] };
  };
  const rows = json.data?.translations ?? [];
  return rows.map((r) => r.translatedText ?? '');
}

function isModelUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const m = error.message.toLowerCase();
  return (
    m.includes('404') ||
    m.includes('not found') ||
    m.includes('was not found') ||
    m.includes('not found for api version')
  );
}

function gcpProjectId(): string | null {
  const id = process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? '';
  return id.trim().length > 0 ? id.trim() : null;
}

function textFromVertexResponse(result: {
  readonly response?: {
    readonly candidates?: readonly {
      readonly content?: { readonly parts?: readonly { readonly text?: string }[] };
    }[];
  };
}): string {
  const t = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof t === 'string' ? t.trim() : '';
}

function isModelTransientCapacityError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return (
    error.message.includes('503') ||
    error.message.includes('Service Unavailable') ||
    error.message.includes('high demand') ||
    error.message.includes('429')
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTPS callable: Gemini on Vertex AI (asia-south1). App Check required.
 * @param request.data.prompt User question (max {@link MAX_PROMPT} chars).
 * @returns `reply` (plain text) and `citations` (URLs).
 */
export const assistantAsk = onCall(
  { ...CALLABLE_BASE, enforceAppCheck: true },
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
    const project = gcpProjectId();
    if (!project) {
      logger.warn('assistant_no_gcp_project');
      throw new HttpsError('failed-precondition', 'vertex_not_configured');
    }
    const fullPrompt = `${RAG_CONTEXT}\n\nUser question:\n${prompt}\n\nRespond in plain text under 400 words.`;
    try {
      const vertex = new VertexAI({ project, location: VERTEX_LOCATION });
      for (const modelName of GEMINI_VERTEX_MODELS) {
        for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES_PER_MODEL; attempt += 1) {
          try {
            const model = vertex.getGenerativeModel({ model: modelName });
            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            });
            const text = textFromVertexResponse(result);
            return {
              reply: text.length > 0 ? text : 'No model text returned.',
              citations: ['https://www.eci.gov.in/voter-education/', 'https://www.eci.gov.in/'],
            };
          } catch (modelErr) {
            if (isModelUnavailableError(modelErr)) {
              const detail = modelErr instanceof Error ? modelErr.message : String(modelErr);
              logger.warn('assistant_model_skip', { modelName, detail });
              break;
            }
            if (isModelTransientCapacityError(modelErr) && attempt < GEMINI_MAX_RETRIES_PER_MODEL) {
              const delayMs = GEMINI_RETRY_BASE_DELAY_MS * 2 ** attempt;
              logger.warn('assistant_model_retry', { modelName, attempt: attempt + 1, delayMs });
              await wait(delayMs);
              continue;
            }
            throw modelErr;
          }
        }
      }
      logger.error('assistant_all_models_unavailable', {
        modelsTried: [...GEMINI_VERTEX_MODELS],
        region: VERTEX_LOCATION,
      });
      throw new HttpsError('failed-precondition', 'assistant_model_unavailable');
    } catch (e) {
      if (e instanceof HttpsError) {
        throw e;
      }
      logger.error('assistant_vertex_error', e);
      throw new HttpsError('internal', 'assistant_failed');
    }
  }
);

/**
 * HTTPS callable: Cloud Translation API v2. App Check required. Secret: `GOOGLE_TRANSLATE_API_KEY`.
 * @param request.data.texts Non-empty string segments (max count/chars per server limits).
 * @param request.data.target BCP-47 target language (e.g. `hi`).
 * @returns `translations` aligned to `texts`.
 */
export const glossaryTranslate = onCall(
  { ...CALLABLE_BASE, enforceAppCheck: true, secrets: [translateApiKey] },
  async (request: CallableRequest): Promise<{ readonly translations: readonly string[] }> => {
    const target = typeof request.data?.target === 'string' ? request.data.target : 'hi';
    const texts = Array.isArray(request.data?.texts) ? (request.data.texts as unknown[]) : [];
    const clean = texts
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (clean.length === 0) {
      throw new HttpsError('invalid-argument', 'texts_required');
    }
    if (clean.length > MAX_TRANSLATE_ITEMS) {
      throw new HttpsError('invalid-argument', 'too_many_segments');
    }
    const totalChars = clean.reduce((n, t) => n + t.length, 0);
    if (totalChars > MAX_TRANSLATE_CHARS) {
      throw new HttpsError('invalid-argument', 'payload_too_large');
    }
    const key = translateApiKey.value().trim();
    if (key.length === 0) {
      throw new HttpsError('failed-precondition', 'translate_not_configured');
    }
    try {
      const translations = await translateWithGoogleCloud(clean, target, key);
      return { translations };
    } catch (e) {
      logger.error('glossary_translate_error', e);
      throw new HttpsError('internal', 'translate_failed');
    }
  }
);

/**
 * HTTPS callable: writes rows to a fixed Google Sheet. App Check required. Secret: `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`.
 * @param request.data.rows Matrix of cell strings (non-empty).
 * @returns Spreadsheet id and edit URL.
 */
export const exportTimelineSheet = onCall(
  { ...CALLABLE_BASE, enforceAppCheck: true, secrets: [sheetsServiceAccountJson] },
  async (
    request: CallableRequest
  ): Promise<{ readonly spreadsheetUrl: string; readonly spreadsheetId: string }> => {
    const rows = Array.isArray(request.data?.rows) ? (request.data.rows as unknown[]) : [];
    const matrix = rows
      .filter((r): r is unknown[] => Array.isArray(r))
      .map((r) => r.map((c) => (typeof c === 'string' ? c : String(c))));
    if (matrix.length === 0) {
      throw new HttpsError('invalid-argument', 'rows_required');
    }
    const rawJson = sheetsServiceAccountJson.value().trim();
    if (rawJson.length === 0) {
      throw new HttpsError('failed-precondition', 'sheets_sa_not_configured');
    }
    let creds: { readonly client_email?: string; readonly private_key?: string };
    try {
      creds = JSON.parse(rawJson) as { readonly client_email?: string; readonly private_key?: string };
    } catch {
      throw new HttpsError('invalid-argument', 'sheets_sa_invalid_json');
    }
    if (!creds.client_email || !creds.private_key) {
      throw new HttpsError('invalid-argument', 'sheets_sa_missing_fields');
    }
    try {
      const auth = new google.auth.JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.values.update({
        spreadsheetId: TIMELINE_EXPORT_SPREADSHEET_ID,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: matrix },
      });
      const spreadsheetId = TIMELINE_EXPORT_SPREADSHEET_ID;
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      return { spreadsheetId, spreadsheetUrl };
    } catch (e) {
      logger.error('export_timeline_sheet_error', e);
      throw new HttpsError('internal', 'sheets_export_failed');
    }
  }
);
