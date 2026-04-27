import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { isFirebaseWebConfigured } from '../firebase/firebase-public';

const FUNCTIONS_REGION = 'asia-south1';

export type AssistantAskResponse = Readonly<{
  readonly reply: string;
  readonly citations: readonly string[];
}>;

export type GlossaryTranslateResponse = Readonly<{
  readonly translations: readonly string[];
}>;

export type ExportSheetResponse = Readonly<{
  readonly spreadsheetUrl: string;
  readonly spreadsheetId: string;
}>;

@Injectable({ providedIn: 'root' })
export class CloudFunctionsService {
  readonly isConfigured = isFirebaseWebConfigured();

  private async callHttps<TReq extends object, TRes>(name: string, data: TReq): Promise<TRes> {
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const fn = httpsCallable(getFunctions(getApp(), FUNCTIONS_REGION), name);
    const res = await fn(data);
    return res.data as TRes;
  }

  assistantAsk(prompt: string): Promise<AssistantAskResponse> {
    return this.callHttps('assistantAsk', { prompt });
  }

  glossaryTranslate(texts: readonly string[], target: 'hi'): Promise<GlossaryTranslateResponse> {
    return this.callHttps('glossaryTranslate', { texts: [...texts], target });
  }

  exportTimelineSheet(rows: readonly (readonly string[])[]): Promise<ExportSheetResponse> {
    return this.callHttps('exportTimelineSheet', { rows: [...rows] });
  }
}
