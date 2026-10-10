import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Listing } from '../../../listings/listing';
import { photoUrl } from '../../../listings/listing-query';
import { vtName } from '../../../ui/format';
import { Icon } from '../../../ui/icon/icon';
import { ViewTransitions } from '../../../view-transitions/view-transitions';
import { SharpPhotos } from '../../../ui/sharp-photos';

/** Hero photo plus four thumbnails. Clicking a thumbnail swaps it into the hero slot. */
@Component({
  selector: 'app-photo-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  providers: [SharpPhotos],
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css',
})
export class PhotoGallery {
  private readonly viewTransitions = inject(ViewTransitions);
  private readonly sharp = inject(SharpPhotos);

  readonly listing = input.required<Listing>();

  /**
   * Which photo sits in which slot (slot 0 is the hero). Resets whenever the listing changes,
   * because the component is reused when navigating between similar listings.
   */
  protected readonly order = linkedSignal(() => this.listing().photos.map((_, i) => i));

  protected readonly slots = computed(() => {
    const { id, photos } = this.listing();
    return this.order().map((index, slot) => {
      const photo = photos[index];
      return {
        index,
        // The hero first renders the card's URL (already cached, so the router's view
        // transition can capture it at once) and switches to a sharper copy when that has loaded.
        src: slot === 0 && this.sharp.isLoaded(photo) ? photoUrl(photo, 1600) : photoUrl(photo),
        // The name follows the *photo*, not the slot. Swapping slots is then just a layout
        // change and the browser morphs both images to their new positions.
        name: vtName('photo', id, index),
      };
    });
  });

  constructor() {
    this.sharp.preload(() => {
      const listing = this.listing();
      return [listing.photos[this.order()[0]]];
    });
  }

  protected show(slot: number): void {
    this.viewTransitions.run(() => {
      this.order.update((order) => {
        const next = [...order];
        [next[0], next[slot]] = [next[slot], next[0]];
        return next;
      });
    }, ['gallery']);
  }
}
