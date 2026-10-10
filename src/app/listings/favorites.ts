import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ViewTransitions } from '../view-transitions/view-transitions';

const STORAGE_KEY = 'homely.favorites';

function readStored(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class Favorites {
  private readonly viewTransitions = inject(ViewTransitions);
  private readonly ids = signal<readonly string[]>(readStored());

  readonly count = computed(() => this.ids().length);
  readonly all = this.ids.asReadonly();

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
      } catch {
        // Storage can be unavailable (private mode); favourites then live for the session only.
      }
    });
  }

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  /**
   * Wrapped in a view transition so that, on the Saved page, the remaining cards glide into
   * the gap left by a removed one instead of jumping.
   */
  toggle(id: string): void {
    this.viewTransitions.run(
      () => this.ids.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
      ['favorite'],
    );
  }
}
