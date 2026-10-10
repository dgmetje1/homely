import { Pipe, PipeTransform } from '@angular/core';

const euros = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

@Pipe({ name: 'euros' })
export class EurosPipe implements PipeTransform {
  transform(value: number): string {
    return euros.format(value);
  }
}

/**
 * `view-transition-name` must be a valid CSS identifier and unique on the page while a
 * transition is running. Listing ids are already kebab-case slugs, so a prefix is enough.
 */
export function vtName(
  kind: 'card' | 'photo' | 'title' | 'price' | 'place' | 'specs',
  id: string,
  index = 0,
): string {
  return index === 0 ? `${kind}-${id}` : `${kind}-${id}-${index}`;
}
