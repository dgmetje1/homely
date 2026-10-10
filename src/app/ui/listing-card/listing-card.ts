import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Favorites } from '../../listings/favorites';
import { Listing } from '../../listings/listing';
import { photoUrl } from '../../listings/listing-query';
import { EurosPipe, vtName } from '../format';
import { Icon } from '../icon/icon';

export type CardLayout = 'grid' | 'list';

@Component({
  selector: 'app-listing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, EurosPipe],
  host: {
    // Every card is its own transition group, so filtering/sorting/removing makes the grid
    // re-flow smoothly. `view-transition-class` lets one CSS rule style all of them.
    '[style.view-transition-name]': 'names().card',
    'style': 'view-transition-class: card',
    '[class.list]': "layout() === 'list'",
  },
  templateUrl: './listing-card.html',
  styleUrl: './listing-card.css',
})
export class ListingCard {
  protected readonly favorites = inject(Favorites);

  readonly listing = input.required<Listing>();
  readonly layout = input<CardLayout>('grid');
  /** Above-the-fold cards load eagerly; they are likely the Largest Contentful Paint. */
  readonly eager = input(false);

  protected readonly cover = computed(() => photoUrl(this.listing().photos[0]));
  protected readonly saved = computed(() => this.favorites.has(this.listing().id));
  protected readonly names = computed(() => {
    const id = this.listing().id;
    return {
      card: vtName('card', id),
      photo: vtName('photo', id),
      title: vtName('title', id),
      price: vtName('price', id),
      place: vtName('place', id),
      specs: vtName('specs', id),
    };
  });
}
