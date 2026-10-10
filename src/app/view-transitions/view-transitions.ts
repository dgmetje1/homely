import { ApplicationRef, DOCUMENT, Injectable, inject } from '@angular/core';

/**
 * Runs state changes that are *not* router navigations (gallery swaps, theme switch,
 * favourites) inside `document.startViewTransition`.
 *
 * The update callback must leave the DOM in its final state before it returns, otherwise the
 * browser captures the "new" snapshot too early. With zoneless change detection nothing
 * renders on its own inside the callback, so we flush synchronously with `ApplicationRef.tick()`.
 */
@Injectable({ providedIn: 'root' })
export class ViewTransitions {
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  get supported(): boolean {
    return typeof this.document.startViewTransition === 'function';
  }

  run(update: () => void, types: string[] = []): ViewTransition | null {
    if (!this.supported) {
      update();
      return null;
    }
    const flush = () => {
      update();
      this.appRef.tick();
    };
    try {
      return this.document.startViewTransition({ update: flush, types });
    } catch {
      // Browsers with level-1 support only accept a callback (no `types`).
      return this.document.startViewTransition(flush);
    }
  }
}
