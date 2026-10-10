import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Amenity } from '../../../listings/listing';
import { Icon } from '../../../ui/icon/icon';

const LABELS: Record<Amenity, string> = {
  wifi: 'Fast wifi',
  parking: 'Private parking',
  'air-conditioning': 'Air conditioning',
  pool: 'Swimming pool',
  garden: 'Garden',
  elevator: 'Lift',
  washer: 'Washing machine',
  heating: 'Central heating',
  pets: 'Pets allowed',
  terrace: 'Terrace',
};

@Component({
  selector: 'app-amenity-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './amenity-list.html',
  styleUrl: './amenity-list.css',
})
export class AmenityList {
  readonly amenities = input.required<readonly Amenity[]>();

  protected readonly items = computed(() => this.amenities().map((a) => ({ icon: a, label: LABELS[a] })));
}
