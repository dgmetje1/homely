import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

export interface SegmentOption {
  icon: string;
  /** Visible text. Omit for icon-only segments and provide `ariaLabel` instead. */
  label?: string;
  ariaLabel?: string;
  /** Merged into the current query params. */
  queryParams: Params;
  active: boolean;
}

/**
 * A pill-style switch made of router links. The active segment carries `pillName` as its
 * `view-transition-name`, so the highlight (and its label) glides to the newly active segment.
 */
@Component({
  selector: 'app-segmented-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  templateUrl: './segmented-nav.html',
  styleUrl: './segmented-nav.css',
})
export class SegmentedNav {
  readonly options = input.required<readonly SegmentOption[]>();
  readonly label = input.required<string>();
  readonly pillName = input.required<string>();
}
