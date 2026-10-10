import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { Listing } from '../../../listings/listing';
import { monthlyMortgage } from '../../../listings/listing-query';
import { EurosPipe, vtName } from '../../../ui/format';
import { Icon } from '../../../ui/icon/icon';
import { ViewTransitions } from '../../../view-transitions/view-transitions';

/** Sticky price card with the deal-specific facts and the call to action. */
@Component({
  selector: 'app-booking-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, EurosPipe],
  templateUrl: './booking-panel.html',
  styleUrl: './booking-panel.css',
})
export class BookingPanel {
  private readonly viewTransitions = inject(ViewTransitions);

  readonly listing = input.required<Listing>();

  protected readonly priceName = computed(() => vtName('price', this.listing().id));
  protected readonly mortgage = computed(() => monthlyMortgage(this.listing().price));
  /** Reset per listing: the component is reused when moving between similar listings. */
  protected readonly requested = linkedSignal({ source: this.listing, computation: () => false });

  /** The button morphs into the confirmation panel (both carry `view-transition-name: cta`). */
  protected request(): void {
    this.viewTransitions.run(() => this.requested.set(true), ['cta']);
  }
}
