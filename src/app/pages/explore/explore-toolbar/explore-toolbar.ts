import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PROPERTY_TYPES, SORT_OPTIONS } from '../../../listings/listing-query';
import { Icon } from '../../../ui/icon/icon';
import { SegmentOption, SegmentedNav } from '../../../ui/segmented-nav/segmented-nav';
import { ExploreState } from '../explore-state';

/** Sticky filter bar: property type chips, rent/buy switch and sort order. */
@Component({
  selector: 'app-explore-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, SegmentedNav],
  templateUrl: './explore-toolbar.html',
  styleUrl: './explore-toolbar.css',
})
export class ExploreToolbar {
  private readonly router = inject(Router);

  readonly state = input.required<ExploreState>();

  protected readonly types = PROPERTY_TYPES;
  protected readonly sortOptions = SORT_OPTIONS;

  protected readonly dealOptions = computed<SegmentOption[]>(() => {
    const deal = this.state().deal;
    return [
      { icon: 'grid', label: 'All', queryParams: { deal: null }, active: !deal },
      { icon: 'key', label: 'Rent', queryParams: { deal: 'rent' }, active: deal === 'rent' },
      { icon: 'tag', label: 'Buy', queryParams: { deal: 'sale' }, active: deal === 'sale' },
    ];
  });

  protected onSort(value: string): void {
    this.router.navigate([], {
      queryParams: { sort: value === 'recommended' ? null : value },
      queryParamsHandling: 'merge',
    });
  }
}
