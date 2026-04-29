import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoPipe } from '@ngneat/transloco';
import { isMapsEmbedConfigured, isNonEmptyConfigValue, readFirebasePublicConfig } from '../../firebase/firebase-public';

const MAP_PLACE_IDS = ['eci_hq', 'eci_vikram', 'ceo_delhi_example'] as const;
type MapPlaceId = (typeof MAP_PLACE_IDS)[number];

const MAP_PLACE_QUERIES: Readonly<Record<MapPlaceId, string>> = {
  eci_hq:
    'Election Commission of India Nirvachan Sadan Ashoka Road New Delhi India',
  eci_vikram:
    'Election Commission of India Vikram Sadan Dr B R Ambedkar Marg ITO New Delhi India',
  ceo_delhi_example:
    'Chief Electoral Officer Delhi Old St Stephen College Building Kashmere Gate Delhi India',
};

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

  protected readonly placeIds = MAP_PLACE_IDS;
  protected readonly selectedPlaceId = signal<MapPlaceId>('eci_hq');

  protected readonly embedSrc = computed((): SafeResourceUrl | null => {
    const key = readFirebasePublicConfig().mapsEmbedApiKey;
    if (!isNonEmptyConfigValue(key)) {
      return null;
    }
    const id = this.selectedPlaceId();
    const query = MAP_PLACE_QUERIES[id] ?? MAP_PLACE_QUERIES.eci_hq;
    const q = encodeURIComponent(query);
    const url = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${q}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly hasKey = computed(() => isMapsEmbedConfigured());

  protected onPlaceChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    if (MAP_PLACE_IDS.includes(v as MapPlaceId)) {
      this.selectedPlaceId.set(v as MapPlaceId);
    }
  }
}
