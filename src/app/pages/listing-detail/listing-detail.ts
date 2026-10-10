import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Favorites } from '../../listings/favorites';
import { LISTINGS } from '../../listings/listings.data';
import { vtName } from '../../ui/format';
import { Icon } from '../../ui/icon/icon';
import { AmenityList } from './amenity-list/amenity-list';
import { BookingPanel } from './booking-panel/booking-panel';
import { PhotoGallery } from './photo-gallery/photo-gallery';
import { SimilarListings } from './similar-listings/similar-listings';

const TYPE_LABELS = {
  flat: 'Flat',
  house: 'House',
  villa: 'Villa',
  loft: 'Loft',
  studio: 'Studio',
  penthouse: 'Penthouse',
} as const;

@Component({
  selector: 'app-listing-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, PhotoGallery, BookingPanel, AmenityList, SimilarListings],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css',
})
export class ListingDetail {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  protected readonly favorites = inject(Favorites);

  /** Route param, bound by `withComponentInputBinding()`. */
  readonly id = input.required<string>();

  protected readonly listing = computed(() => LISTINGS.find((l) => l.id === this.id()));
  protected readonly typeLabel = computed(() => TYPE_LABELS[this.listing()?.type ?? 'flat']);
  protected readonly titleName = computed(() => vtName('title', this.id()));

  protected back(): void {
    // Prefer a real history pop: it restores the list's scroll position and filters.
    if (this.router.lastSuccessfulNavigation()?.previousNavigation) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
