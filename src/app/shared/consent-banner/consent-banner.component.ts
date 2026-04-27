import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';
import { isFirebaseAnalyticsConfigured } from '../../firebase/firebase-public';
import { PrivacyConsentService } from '../../services/privacy-consent.service';

@Component({
  standalone: true,
  selector: 'app-consent-banner',
  imports: [TranslocoPipe],
  templateUrl: './consent-banner.component.html',
  styleUrl: './consent-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentBannerComponent {
  private readonly privacy = inject(PrivacyConsentService);

  protected readonly visible = computed(
    () => isFirebaseAnalyticsConfigured() && this.privacy.decision() === 'pending'
  );

  accept(): void {
    this.privacy.acceptAnalytics();
  }

  decline(): void {
    this.privacy.declineAnalytics();
  }
}
