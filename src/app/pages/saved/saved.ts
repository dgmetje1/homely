import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Favorites } from '../../listings/favorites';
import { LISTINGS } from '../../listings/listings.data';
import { Icon } from '../../ui/icon/icon';
import { ListingCard } from '../../ui/listing-card/listing-card';

@Component({
  selector: 'app-saved',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, ListingCard],
  templateUrl: './saved.html',
  styleUrl: './saved.css',
})
export class Saved {
  private readonly favorites = inject(Favorites);

  protected readonly saved = computed(() => {
    const ids = this.favorites.all();
    return LISTINGS.filter((l) => ids.includes(l.id));
  });
}
