import firebasePublic from '../../assets/config/firebase-public.json';

export type FirebasePublicConfig = Readonly<{
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId: string;
  readonly appCheckSiteKey: string;
  /** Optional: Maps Embed API key (HTTP referrer–restricted in Google Cloud Console). */
  readonly mapsEmbedApiKey: string;
}>;

const file = firebasePublic as FirebasePublicConfig;

export function readFirebasePublicConfig(): FirebasePublicConfig {
  return file;
}

export function isNonEmptyConfigValue(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isFirebaseWebConfigured(): boolean {
  return (
    isNonEmptyConfigValue(file.apiKey) &&
    isNonEmptyConfigValue(file.projectId) &&
    isNonEmptyConfigValue(file.appId)
  );
}

export function isFirebaseAnalyticsConfigured(): boolean {
  return isFirebaseWebConfigured() && isNonEmptyConfigValue(file.measurementId);
}

export function isMapsEmbedConfigured(): boolean {
  return isNonEmptyConfigValue(file.mapsEmbedApiKey);
}
