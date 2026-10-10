import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { photoUrl } from '../../listings/listing-query';
import { LISTINGS } from '../../listings/listings.data';
import { vtName } from '../../ui/format';
import { Icon } from '../../ui/icon/icon';
import { SharpPhotos } from '../../ui/sharp-photos';
import { Direction } from '../../view-transitions/transition-types';

/**
 * Full-screen photo viewer at /listing/:id/photos/:index.
 *
 * Being a route, opening/closing and paging are router navigations, so they get view transitions
 * for free: the photo keeps the same `view-transition-name` as in the gallery (open/close morph),
 * and paging tags the transition `photo-next`/`photo-prev` for a directional slide.
 */
@Component({
  selector: 'app-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  providers: [SharpPhotos],
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-label]': "'Photos of ' + (listing()?.title ?? 'this home')",
    '(document:keydown)': 'onKey($event)',
  },
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.css',
})
export class Lightbox {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sharp = inject(SharpPhotos);

  // Route params, bound by `withComponentInputBinding()`.
  readonly id = input.required<string>();
  readonly index = input.required({ transform: numberAttribute });

  protected readonly listing = computed(() => LISTINGS.find((l) => l.id === this.id()));
  protected readonly count = computed(() => this.listing()?.photos.length ?? 0);
  /** Clamped, so a hand-edited URL can't point past the last photo. */
  protected readonly current = computed(() => Math.min(Math.max(this.index() || 0, 0), this.count() - 1));

  protected readonly photo = computed(() => {
    const listing = this.listing();
    if (!listing) return null;
    const id = listing.photos[this.current()];
    return {
      src: photoUrl(id, this.sharp.isLoaded(id) ? 1600 : 800),
      name: vtName('photo', listing.id, this.current()),
    };
  });

  protected readonly thumbs = computed(() =>
    (this.listing()?.photos ?? []).map((id, i) => ({ src: photoUrl(id), active: i === this.current() })),
  );

  constructor() {
    // Sharpen the current photo and warm up its neighbours so paging is instant.
    this.sharp.preload(() => {
      const photos = this.listing()?.photos ?? [];
      const i = this.current();
      return [photos[i], photos[(i + 1) % photos.length], photos[(i - 1 + photos.length) % photos.length]].filter(
        Boolean,
      );
    });
  }

  protected go(step: 1 | -1): void {
    const count = this.count();
    this.show((this.current() + step + count) % count, step === 1 ? 'next' : 'prev');
  }

  protected show(index: number, direction: Direction = index > this.current() ? 'next' : 'prev'): void {
    if (index === this.current()) return;
    // replaceUrl: paging shouldn't fill the history; Back closes the viewer.
    // state.direction: lets onViewTransitionCreated tell a wrap-around "next" from a "prev".
    this.router.navigate(['/listing', this.id(), 'photos', index], {
      replaceUrl: true,
      state: { direction, fromDetail: this.cameFromDetail() },
    });
  }

  protected close(): void {
    if (this.cameFromDetail()) {
      this.location.back();
    } else {
      this.router.navigate(['/listing', this.id()]);
    }
  }

  private swipeX: number | null = null;

  protected swipeStart(event: PointerEvent): void {
    this.swipeX = event.clientX;
  }

  /** A horizontal swipe of 50px or more pages, like the arrow keys. */
  protected swipeEnd(event: PointerEvent): void {
    if (this.swipeX === null) return;
    const dx = event.clientX - this.swipeX;
    this.swipeX = null;
    if (Math.abs(dx) >= 50) this.go(dx < 0 ? 1 : -1);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close();
    else if (event.key === 'ArrowRight') this.go(1);
    else if (event.key === 'ArrowLeft') this.go(-1);
  }

  /** True when the detail page is the previous history entry (set by the gallery's links). */
  private cameFromDetail(): boolean {
    return history.state?.fromDetail === true;
  }
}
