import { ResolveFn } from '@angular/router';
import { photoUrl } from './listing-query';

/** Upper bound on how long a navigation waits for photos, so a slow network never stalls it. */
const MAX_WAIT_MS = 400;

/**
 * Downloads and decodes a listing's photos before the route activates.
 *
 * Resolvers run *before* the router starts the view transition. Images that are decoded by then
 * render immediately in the new view, so the browser's "after" snapshot contains them. Without
 * this, the gallery thumbnails would be captured blank and pop in when the transition ends.
 */
export const preloadListingPhotos: ResolveFn<void> = async (route) => {
  // Imported lazily so the route config doesn't pull the listing data into the main bundle.
  const { LISTINGS } = await import('./listings.data');
  const listing = LISTINGS.find((l) => l.id === route.paramMap.get('id'));
  if (!listing) return;
  const decoded = Promise.allSettled(listing.photos.map((id) => decode(photoUrl(id))));
  await Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS))]);
};

function decode(src: string): Promise<void> {
  const img = new Image();
  img.src = src;
  return img.decode();
}
