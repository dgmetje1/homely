import { Routes } from '@angular/router';
import { preloadListingPhotos } from './listings/preload-photos.resolver';

/**
 * `data.page` and `data.tab` feed `transitionTypes()`, which decides the animation of each
 * navigation (see view-transitions/transition-types.ts).
 */
export const routes: Routes = [
  {
    path: '',
    title: 'homely · Find a home to rent or buy',
    data: { page: 'explore', tab: 0 },
    loadComponent: () => import('./pages/explore/explore').then((m) => m.Explore),
  },
  {
    path: 'saved',
    title: 'Saved homes · homely',
    data: { page: 'saved', tab: 1 },
    loadComponent: () => import('./pages/saved/saved').then((m) => m.Saved),
  },
  {
    path: 'listing/:id',
    title: 'Home details · homely',
    data: { page: 'detail' },
    // Photos must be decoded before the view transition snapshots the page (see resolver).
    resolve: { photos: preloadListingPhotos },
    loadComponent: () => import('./pages/listing-detail/listing-detail').then((m) => m.ListingDetail),
  },
  {
    path: 'listing/:id/photos/:index',
    title: 'Photos · homely',
    data: { page: 'lightbox' },
    loadComponent: () => import('./pages/lightbox/lightbox').then((m) => m.Lightbox),
  },
  { path: '**', redirectTo: '' },
];
