import { Deal, Listing, ListingQuery, PropertyType, SortKey } from './listing';

export const PROPERTY_TYPES: readonly { value: PropertyType; label: string; icon: string }[] = [
  { value: 'flat', label: 'Flats', icon: 'building' },
  { value: 'house', label: 'Houses', icon: 'home' },
  { value: 'villa', label: 'Villas', icon: 'villa' },
  { value: 'loft', label: 'Lofts', icon: 'loft' },
  { value: 'studio', label: 'Studios', icon: 'studio' },
  { value: 'penthouse', label: 'Penthouses', icon: 'penthouse' },
];

export const SORT_OPTIONS: readonly { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

export function isDeal(value: unknown): value is Deal {
  return value === 'rent' || value === 'sale';
}

export function isPropertyType(value: unknown): value is PropertyType {
  return PROPERTY_TYPES.some((t) => t.value === value);
}

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((s) => s.value === value);
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function queryListings(listings: readonly Listing[], query: ListingQuery): Listing[] {
  const needle = normalize(query.q?.trim() ?? '');

  const matches = listings.filter(
    (l) =>
      (!query.deal || l.deal === query.deal) &&
      (!query.type || l.type === query.type) &&
      (!needle ||
        normalize(`${l.title} ${l.city} ${l.country} ${l.neighbourhood}`).includes(needle)),
  );

  switch (query.sort) {
    case 'price-asc':
      return matches.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return matches.sort((a, b) => b.price - a.price);
    case 'rating':
      return matches.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    default:
      return matches;
  }
}

/** Listings of the same deal, ranked by how much they have in common with `listing`. */
export function similarListings(listings: readonly Listing[], listing: Listing, count = 4): Listing[] {
  const score = (l: Listing) =>
    (l.city === listing.city ? 2 : 0) + (l.type === listing.type ? 1 : 0);
  return listings
    .filter((l) => l.id !== listing.id && l.deal === listing.deal)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count);
}

/** Monthly payment of a fixed-rate mortgage (annuity formula). */
export function monthlyMortgage(price: number, downPayment = 0.2, annualRate = 0.032, years = 30): number {
  const principal = price * (1 - downPayment);
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Local copies downloaded by `pnpm photos`, in two sizes. */
export function photoUrl(photoId: string, width: 800 | 1600 = 800): string {
  return `photos/${photoId}-${width}.webp`;
}
