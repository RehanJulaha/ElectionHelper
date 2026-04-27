import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoPipe } from '@ngneat/transloco';
import { isMapsEmbedConfigured, isNonEmptyConfigValue, readFirebasePublicConfig } from '../../firebase/firebase-public';

@Component({
  standalone: true,
  selector: 'app-eci-locator',
  imports: [TranslocoPipe],
  templateUrl: './eci-locator.component.html',
  styleUrl: './eci-locator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EciLocatorComponent {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly embedSrc = computed((): SafeResourceUrl | null => {
    const key = readFirebasePublicConfig().mapsEmbedApiKey;
    if (!isNonEmptyConfigValue(key)) {
      return null;
    }
    const q = encodeURIComponent(
      'Election Commission of India Nirvachan Sadan Ashoka Road New Delhi India'
    );
    const url = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${q}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly hasKey = computed(() => isMapsEmbedConfigured());
}
