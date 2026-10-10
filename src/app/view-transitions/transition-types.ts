import { ActivatedRouteSnapshot } from '@angular/router';

/** The bits of a route that decide which animation a navigation gets. */
export interface PageState {
  page: string | undefined;
  /** Position in the main navigation, used to pick a slide direction between tabs. */
  tab: number | undefined;
  params: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string>>;
}

/** Optional hint passed as navigation `state`, for moves the URLs alone can't explain. */
export type Direction = 'next' | 'prev';

export function pageStateOf(root: ActivatedRouteSnapshot): PageState {
  let leaf = root;
  while (leaf.firstChild) leaf = leaf.firstChild;
  return { page: leaf.data['page'], tab: leaf.data['tab'], params: leaf.params, query: leaf.queryParams };
}

/**
 * Maps a navigation to View Transition *types*. The browser exposes them to CSS through
 * `:active-view-transition-type(...)`, so styles.css can pick a different choreography per
 * kind of navigation while the router keeps calling `startViewTransition` for us.
 */
export function transitionTypes(from: PageState, to: PageState, direction?: Direction): string[] {
  if (from.page === 'lightbox' && to.page === 'lightbox') {
    // A wrap-around (last → first) is still "next", so prefer the explicit hint.
    const forward = direction ? direction === 'next' : Number(to.params['index']) > Number(from.params['index']);
    return [forward ? 'photo-next' : 'photo-prev'];
  }
  if (to.page === 'lightbox') return ['lightbox-open'];
  if (from.page === 'lightbox') return ['lightbox-close'];
  if (from.page === 'detail' && to.page === 'detail') {
    return from.params['id'] === to.params['id'] ? [] : ['detail-swap'];
  }
  if (to.page === 'detail') return ['to-detail'];
  if (from.page === 'detail') return ['to-list'];
  if (from.page === to.page) {
    return (from.query['view'] ?? 'grid') === (to.query['view'] ?? 'grid') ? ['filter'] : ['layout'];
  }
  if (from.tab !== undefined && to.tab !== undefined) {
    return [to.tab > from.tab ? 'tab-forward' : 'tab-back'];
  }
  return [];
}
