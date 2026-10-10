import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Favorites } from '../../listings/favorites';
import { ThemeService } from '../../theme';
import { Icon } from '../../ui/icon/icon';

@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  host: { role: 'banner' },
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader {
  private readonly router = inject(Router);
  protected readonly favorites = inject(Favorites);
  protected readonly theme = inject(ThemeService);

  protected readonly search = signal('');
  protected readonly exploreMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Keep the search box in sync with the URL (back/forward, "clear filters" links…).
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const q = this.router.parseUrl(this.router.url).queryParams['q'] ?? '';
        if (q !== this.search().trim()) this.search.set(q);
      });
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchTimer);
    // Debounced, so the grid re-flows once per pause in typing rather than per keystroke.
    this.searchTimer = setTimeout(() => {
      const onExplore = this.router.url.split('?')[0] === '/';
      this.router.navigate(['/'], {
        queryParams: { q: value.trim() || null },
        queryParamsHandling: onExplore ? 'merge' : '',
        replaceUrl: onExplore,
      });
    }, 250);
  }

  protected toggleTheme(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.theme.toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }
}
