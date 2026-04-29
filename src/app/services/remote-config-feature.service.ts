import { Injectable, signal, isDevMode } from '@angular/core';
import { getApp } from 'firebase/app';
import { isFirebaseWebConfigured } from '../firebase/firebase-public';

@Injectable({ providedIn: 'root' })
export class RemoteConfigFeatureService {
  private readonly footerPromoState = signal<string>('');
  private readonly rajyaPreviewState = signal(false);
  private readonly packChannelState = signal<'assets' | 'firestore'>('assets');

  readonly footerPromo = this.footerPromoState.asReadonly();
  readonly rajyaSabhaPreview = this.rajyaPreviewState.asReadonly();
  readonly electionPackChannel = this.packChannelState.asReadonly();

  async initializeWhenFirebaseReady(): Promise<void> {
    if (!isFirebaseWebConfigured()) {
      return;
    }
    try {
      const { getRemoteConfig, fetchAndActivate, getValue } = await import('firebase/remote-config');
      const rc = getRemoteConfig(getApp());
      rc.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 60 * 60 * 1000;
      rc.defaultConfig = {
        footer_promo_text: '',
        rajya_sabha_preview: 'false',
        election_pack_channel: 'assets',
      };
      await fetchAndActivate(rc);
      this.footerPromoState.set(getValue(rc, 'footer_promo_text').asString().trim());
      this.rajyaPreviewState.set(getValue(rc, 'rajya_sabha_preview').asBoolean());
      const ch = getValue(rc, 'election_pack_channel').asString();
      this.packChannelState.set(ch === 'firestore' ? 'firestore' : 'assets');
    } catch {
      void 0;
    }
  }
}
