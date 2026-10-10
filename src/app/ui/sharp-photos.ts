import { Injectable, effect, signal } from '@angular/core';
import { photoUrl } from '../listings/listing-query';

/**
 * Tracks which photos have their high-resolution (1600px) file in the browser cache.
 *
 * Views render the 800px file first, which is already cached from the listing card, so the
 * view transition can snapshot a real image immediately. Once the sharp copy has downloaded,
 * `isLoaded()` flips and the view swaps it in. Provide it per component.
 */
@Injectable()
export class SharpPhotos {
  private readonly loaded = signal<ReadonlySet<string>>(new Set());

  isLoaded(photoId: string): boolean {
    return this.loaded().has(photoId);
  }

  /** Keeps preloading whatever `photos` returns. Call from an injection context. */
  preload(photos: () => readonly string[]): void {
    effect(() => {
      for (const photo of photos()) {
        if (this.isLoaded(photo)) continue;
        const img = new Image();
        img.onload = () => this.loaded.update((set) => new Set(set).add(photo));
        img.src = photoUrl(photo, 1600);
      }
    });
  }
}
