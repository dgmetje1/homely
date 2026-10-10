import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { queryListings } from '../../listings/listing-query';
import { LISTINGS } from '../../listings/listings.data';
import { Icon } from '../../ui/icon/icon';
import { ListingCard } from '../../ui/listing-card/listing-card';
import { SegmentOption, SegmentedNav } from '../../ui/segmented-nav/segmented-nav';
import { parseExploreState } from './explore-state';
import { ExploreToolbar } from './explore-toolbar/explore-toolbar';

@Component({
  selector: 'app-explore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, ListingCard, SegmentedNav, ExploreToolbar],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore {
  // Bound from query params by `withComponentInputBinding()`.
  readonly deal = input<string>();
  readonly type = input<string>();
  readonly sort = input<string>();
  readonly q = input<string>();
  readonly view = input<string>();

  protected readonly state = computed(() =>
    parseExploreState({ deal: this.deal(), type: this.type(), sort: this.sort(), q: this.q(), view: this.view() }),
  );

  protected readonly results = computed(() => queryListings(LISTINGS, this.state()));

  protected readonly viewOptions = computed<SegmentOption[]>(() => {
    const view = this.state().view;
    return [
      { icon: 'grid', ariaLabel: 'Grid view', queryParams: { view: null }, active: view === 'grid' },
      { icon: 'list', ariaLabel: 'List view', queryParams: { view: 'list' }, active: view === 'list' },
    ];
  });
}
