import { Deal, PropertyType, SortKey } from '../../listings/listing';
import { isDeal, isPropertyType, isSortKey } from '../../listings/listing-query';
import { CardLayout } from '../../ui/listing-card/listing-card';

/** Everything the Explore page shows, as encoded in its query params. */
export interface ExploreState {
  deal: Deal | undefined;
  type: PropertyType | undefined;
  sort: SortKey;
  q: string;
  view: CardLayout;
}

export interface ExploreParams {
  deal?: string;
  type?: string;
  sort?: string;
  q?: string;
  view?: string;
}

/** Untrusted URL values in, a valid state out. Unknown values fall back to defaults. */
export function parseExploreState(params: ExploreParams): ExploreState {
  return {
    deal: isDeal(params.deal) ? params.deal : undefined,
    type: isPropertyType(params.type) ? params.type : undefined,
    sort: isSortKey(params.sort) ? params.sort : 'recommended',
    q: params.q ?? '',
    view: params.view === 'list' ? 'list' : 'grid',
  };
}
