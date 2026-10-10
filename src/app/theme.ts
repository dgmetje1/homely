import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { ViewTransitions } from './view-transitions/view-transitions';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'homely.theme';

/** Matches `--surface` in styles.css. */
const THEME_COLORS: Record<Theme, string> = { light: '#ffffff', dark: '#141417' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly viewTransitions = inject(ViewTransitions);

  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.dataset['theme'] = theme;
      // Browser UI (mobile address bar, PWA title bar) follows the app's theme, not the OS one.
      for (const meta of this.document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
        meta.content = THEME_COLORS[theme];
      }
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Not persisted; fine for a demo.
      }
    });
  }

  /**
   * Switches theme with a circular reveal that grows from the clicked button.
   *
   * Only the root snapshot is animated here, so while this transition runs every other
   * `view-transition-name` is switched off (see `.vt-theme` in styles.css). Otherwise named
   * elements such as cards would cross-fade on their own, outside the circle.
   */
  toggle(origin?: { x: number; y: number }): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const root = this.document.documentElement;

    root.classList.add('vt-theme');
    const transition = this.viewTransitions.run(() => this.theme.set(next), ['theme']);
    if (!transition) {
      root.classList.remove('vt-theme');
      return;
    }
    transition.finished.finally(() => root.classList.remove('vt-theme'));
    if (prefers('(prefers-reduced-motion: reduce)')) return;

    const x = origin?.x ?? innerWidth / 2;
    const y = origin?.y ?? 0;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    transition.ready
      .then(() =>
        root.animate(
          { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' },
        ),
      )
      .catch(() => {});
  }

  private initialTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // ignore
    }
    return prefers('(prefers-color-scheme: dark)') ? 'dark' : 'light';
  }
}

function prefers(query: string): boolean {
  return typeof matchMedia === 'function' && matchMedia(query).matches;
}
