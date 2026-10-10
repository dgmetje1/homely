import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { monthlyMortgage, queryListings, similarListings } from './listings/listing-query';
import { LISTINGS } from './listings/listings.data';
import { parseExploreState } from './pages/explore/explore-state';
import { PageState, transitionTypes } from './view-transitions/transition-types';

const page = (page: string, extra: Partial<PageState> = {}): PageState => ({
  page,
  tab: undefined,
  params: {},
  query: {},
  ...extra,
});

describe('transitionTypes', () => {
  it('morphs into a detail page from any list', () => {
    expect(transitionTypes(page('explore', { tab: 0 }), page('detail'))).toEqual(['to-detail']);
    expect(transitionTypes(page('saved', { tab: 1 }), page('detail'))).toEqual(['to-detail']);
  });

  it('morphs back to the list', () => {
    expect(transitionTypes(page('detail'), page('explore', { tab: 0 }))).toEqual(['to-list']);
  });

  it('swaps between two different listings', () => {
    const a = page('detail', { params: { id: 'a' } });
    const b = page('detail', { params: { id: 'b' } });
    expect(transitionTypes(a, b)).toEqual(['detail-swap']);
    expect(transitionTypes(a, a)).toEqual([]);
  });

  it('treats query param changes on the same page as filtering', () => {
    expect(transitionTypes(page('explore', { tab: 0 }), page('explore', { tab: 0 }))).toEqual(['filter']);
  });

  it('distinguishes a layout switch from filtering', () => {
    const grid = page('explore', { tab: 0, query: { type: 'flat' } });
    const list = page('explore', { tab: 0, query: { type: 'flat', view: 'list' } });
    expect(transitionTypes(grid, list)).toEqual(['layout']);
    expect(transitionTypes(list, { ...list, query: { view: 'list' } })).toEqual(['filter']);
  });

  it('opens, pages through and closes the lightbox', () => {
    const detail = page('detail', { params: { id: 'a' } });
    const photo = (index: string) => page('lightbox', { params: { id: 'a', index } });
    expect(transitionTypes(detail, photo('0'))).toEqual(['lightbox-open']);
    expect(transitionTypes(photo('1'), photo('2'))).toEqual(['photo-next']);
    expect(transitionTypes(photo('2'), photo('1'))).toEqual(['photo-prev']);
    // Wrapping from the last photo to the first is still "next" when the caller says so.
    expect(transitionTypes(photo('4'), photo('0'), 'next')).toEqual(['photo-next']);
    expect(transitionTypes(photo('0'), detail)).toEqual(['lightbox-close']);
  });

  it('slides between tabs in navigation order', () => {
    expect(transitionTypes(page('explore', { tab: 0 }), page('saved', { tab: 1 }))).toEqual(['tab-forward']);
    expect(transitionTypes(page('saved', { tab: 1 }), page('explore', { tab: 0 }))).toEqual(['tab-back']);
  });
});

describe('queryListings', () => {
  it('filters by deal and type', () => {
    const result = queryListings(LISTINGS, { deal: 'sale', type: 'villa' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((l) => l.deal === 'sale' && l.type === 'villa')).toBe(true);
  });

  it('searches city and neighbourhood ignoring accents and case', () => {
    expect(queryListings(LISTINGS, { q: 'MALASANA' }).map((l) => l.id)).toEqual(['malasana-red-chair-flat']);
    expect(queryListings(LISTINGS, { q: 'lisbon' }).every((l) => l.city === 'Lisbon')).toBe(true);
  });

  it('sorts by price without mutating the source', () => {
    const first = LISTINGS[0];
    const prices = queryListings(LISTINGS, { sort: 'price-asc' }).map((l) => l.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(LISTINGS[0]).toBe(first);
  });
});

describe('parseExploreState', () => {
  it('keeps valid params and drops unknown ones', () => {
    expect(parseExploreState({ deal: 'rent', type: 'loft', sort: 'rating', q: 'porto', view: 'list' })).toEqual({
      deal: 'rent',
      type: 'loft',
      sort: 'rating',
      q: 'porto',
      view: 'list',
    });
    expect(parseExploreState({ deal: 'lease', type: 'castle', sort: 'random', view: 'map' })).toEqual({
      deal: undefined,
      type: undefined,
      sort: 'recommended',
      q: '',
      view: 'grid',
    });
  });
});

describe('similarListings', () => {
  it('returns other listings with the same deal', () => {
    const listing = LISTINGS[0];
    const similar = similarListings(LISTINGS, listing);
    expect(similar).toHaveLength(4);
    expect(similar.every((l) => l.deal === listing.deal && l.id !== listing.id)).toBe(true);
  });
});

describe('monthlyMortgage', () => {
  it('matches the annuity formula', () => {
    // 400k borrowed at 3.2% over 30 years ≈ €1,730 / month.
    expect(Math.round(monthlyMortgage(500_000))).toBe(1730);
  });
});

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.logo')?.textContent).toContain('homely');
    expect(el.querySelector('input[type=search]')).not.toBeNull();
  });
});
