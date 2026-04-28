import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from 'googleapis';

const MAX_PROMPT = 2000;
const MAX_TRANSLATE_CHARS = 8000;
const MAX_TRANSLATE_ITEMS = 40;
const TIMELINE_EXPORT_SPREADSHEET_ID = '1aBfhaCp4jfZpQofiwlqg7r7yvVI2TrhLDrIa7P3ZXYQ';
const GEMINI_MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
const GEMINI_MAX_RETRIES_PER_MODEL = 2;
const GEMINI_RETRY_BASE_DELAY_MS = 600;

/** Gen2 callables sit behind Cloud Run; browsers need unauthenticated HTTP invoke so OPTIONS/POST reach the handler (App Check + Firebase still gate abuse). */
const CALLABLE_BASE = { region: 'asia-south1' as const, invoker: 'public' as const };

/** Secret Manager *names* only — never put key material or JSON in source (use `firebase functions:secrets:set`). */
const geminiApiKey = defineSecret('GEMINI_API_KEY');
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
  return error.message.includes('404') || error.message.includes('not found for API version');
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

export const assistantAsk = onCall(
  { ...CALLABLE_BASE, enforceAppCheck: true, secrets: [geminiApiKey] },
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
    const key = geminiApiKey.value().trim();
    if (key.length === 0) {
      logger.warn('assistant_stub_no_secret');
      return {
        reply:
          'Gemini API key is not bound in Secret Manager yet. Wire Secret Manager secret GEMINI_API_KEY to this function, then redeploy. Until then, verify facts on https://www.eci.gov.in/ .',
        citations: ['https://www.eci.gov.in/voter-education/'],
      };
    }
    try {
      const genAI = new GoogleGenerativeAI(key);
      const fullPrompt = `${RAG_CONTEXT}\n\nUser question:\n${prompt}\n\nRespond in plain text under 400 words.`;
      for (const modelName of GEMINI_MODEL_CANDIDATES) {
        for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES_PER_MODEL; attempt += 1) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(fullPrompt);
            const text = result.response.text().trim();
            return {
              reply: text.length > 0 ? text : 'No model text returned.',
              citations: ['https://www.eci.gov.in/voter-education/', 'https://www.eci.gov.in/'],
            };
          } catch (modelErr) {
            if (isModelUnavailableError(modelErr)) {
              logger.warn('assistant_model_unavailable', { modelName });
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
      throw new HttpsError('failed-precondition', 'assistant_model_unavailable');
    } catch (e) {
      if (e instanceof HttpsError) {
        throw e;
      }
      logger.error('assistant_gemini_error', e);
      throw new HttpsError('internal', 'assistant_failed');
    }
  }
);

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
