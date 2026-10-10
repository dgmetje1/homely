import { Injectable, Injector, afterNextRender, inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

/**
 * Scroll restoration that cooperates with router view transitions.
 *
 * The built-in `withInMemoryScrolling` scrolls on a timer/animation frame *after*
 * `NavigationEnd`. With view transitions this can land after the browser has captured the new
 * snapshot, so a shared element morphs towards where it was before the scroll and then jumps.
 *
 * Instead, the scroll is tied to the transition itself: the router resolves the transition's
 * update callback once the new view has rendered, and the browser captures the new state at the
 * following frame. Scrolling right after `updateCallbackDone` therefore happens with the new
 * DOM in place *and* before the capture, so every morph lands where the element ends up.
 *
 * Navigations without a transition (first load, browsers without the API) scroll after their
 * render instead.
 */
@Injectable({ providedIn: 'root' })
export class TransitionScroller {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly positions = new Map<number, number>();
  private currentId = 0;
  /** Where the navigation in progress should leave the page; `null` keeps the position. */
  private target: number | null = null;
  private viaTransition = false;

  init(): void {
    history.scrollRestoration = 'manual';

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.positions.set(this.currentId, window.scrollY);
        this.viaTransition = false;
        const restored = event.restoredState?.navigationId;
        if (restored !== undefined) {
          this.target = this.positions.get(restored) ?? 0;
        } else {
          // Filtering on the same page keeps the reader where they are.
          const samePath = pathOf(event.url) === pathOf(this.router.url);
          this.target = samePath ? null : 0;
        }
      } else if (event instanceof NavigationEnd) {
        this.currentId = event.id;
        if (!this.viaTransition) {
          const target = this.target;
          afterNextRender({ write: () => scrollTo(target) }, { injector: this.injector });
        }
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.target = null;
      }
    });
  }

  /** Called from `withViewTransitions({ onViewTransitionCreated })` for every routed transition. */
  attach(transition: ViewTransition): void {
    this.viaTransition = true;
    transition.updateCallbackDone.then(() => scrollTo(this.target)).catch(() => {});
  }
}

function scrollTo(top: number | null): void {
  if (top !== null) window.scrollTo({ top, behavior: 'instant' });
}

function pathOf(url: string): string {
  return url.split(/[?#]/)[0];
}
