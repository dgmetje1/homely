import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Listing } from '../../../listings/listing';
import { similarListings } from '../../../listings/listing-query';
import { LISTINGS } from '../../../listings/listings.data';
import { ListingCard } from '../../../ui/listing-card/listing-card';

/**
 * Below the fold, so ListingDetail loads it with `@defer (on viewport)` in its own chunk.
 * Clicking one of these cards is a detail → detail navigation (`detail-swap` transition).
 */
@Component({
  selector: 'app-similar-listings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListingCard],
  templateUrl: './similar-listings.html',
  styleUrl: './similar-listings.css',
})
export class SimilarListings {
  readonly listing = input.required<Listing>();

  protected readonly similar = computed(() => similarListings(LISTINGS, this.listing()));
}
