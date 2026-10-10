export type Deal = 'rent' | 'sale';

export type PropertyType = 'flat' | 'house' | 'villa' | 'loft' | 'studio' | 'penthouse';

export type Amenity =
  | 'wifi'
  | 'parking'
  | 'air-conditioning'
  | 'pool'
  | 'garden'
  | 'elevator'
  | 'washer'
  | 'heating'
  | 'pets'
  | 'terrace';

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

export interface Agent {
  name: string;
  agency: string;
  yearsActive: number;
}

export interface Listing {
  id: string;
  title: string;
  type: PropertyType;
  deal: Deal;
  city: string;
  country: string;
  neighbourhood: string;
  /** Monthly rent for `rent`, total asking price for `sale`. In euros. */
  price: number;
  bedrooms: number;
  bathrooms: number;
  /** Square metres. */
  area: number;
  rating: number;
  reviews: number;
  /** Unsplash photo ids. The first one is the cover. */
  photos: string[];
  description: string;
  amenities: Amenity[];
  agent: Agent;
  badge?: 'Top rated' | 'New' | 'Price drop';
}

export interface ListingQuery {
  deal?: Deal;
  type?: PropertyType;
  q?: string;
  sort?: SortKey;
}
