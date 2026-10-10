import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** 24×24 stroke icons. Each entry is a single SVG path `d` attribute. */
const ICONS: Record<string, string> = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.3-4.3',
  bookmark: 'M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  'arrow-left': 'M19 12H5m7 7-7-7 7-7',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4m4-4v13',
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  building: 'M4 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17m0-12h3a1 1 0 0 1 1 1v11M2 21h20M8 7h4m-4 4h4m-4 4h4',
  villa: 'M3 11l9-7 9 7M5 9.5V15h14V9.5M2 19c1.7 0 1.7-1 3.3-1s1.7 1 3.4 1 1.6-1 3.3-1 1.7 1 3.3 1 1.7-1 3.4-1 1.6 1 2.3 1',
  loft: 'M2 21V10l5 3v-3l5 3v-3l5 3V4h4v17zm0 0h20',
  studio: 'M4 4h16v16H4zm0 6h16M10 4v6',
  penthouse: 'M6 21V10h12v11M3 21h18M9 14h2m2 0h2m-6 3h2m2 0h2M8 7l2-3 2 2 2-2 2 3z',
  bed: 'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 16h20M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4',
  bath: 'M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm3 0V5a2 2 0 0 1 3.5-1.3M7 20l-1 2m11-2 1 2',
  area: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3',
  pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  key: 'M15.5 7.5 19 4m2-2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3M11.4 11.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8z',
  tag: 'M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4zM7.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
  calendar: 'M3 5h18v16H3zm0 5h18M8 3v4m8-4v4',
  wifi: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
  parking: 'M4 3h16v18H4zm5 14V7h4a3 3 0 0 1 0 6H9',
  'air-conditioning': 'M12 2v20M2 12h20M4.9 4.9l14.2 14.2m0-14.2L4.9 19.1',
  pool: 'M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 2-2M2 18c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 2-2M8 4v8m8-8v8',
  garden: 'M12 2 5 12h4l-4 6h14l-4-6h4zm0 16v4',
  elevator: 'M5 3h14v18H5zm4 6 3-3 3 3m-6 6 3 3 3-3',
  washer: 'M4 3h16v18H4zm0 4h16m-8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  heating: 'M12 22a7 7 0 0 0 7-7c0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-5-3-7 0 4-4 7-4 13a7 7 0 0 0 7 7z',
  pets: 'M8 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-11.5 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm15 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 12c-3 0-6 4-6 7a2 2 0 0 0 3 1.5c1-.5 2-.8 3-.8s2 .3 3 .8a2 2 0 0 0 3-1.5c0-3-3-7-6-7z',
  terrace: 'M12 3 3 8h18zM5 8v3m14-3v3M3 21h18M6 21v-7h12v7M12 11v3',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  close: 'M18 6 6 18M6 6l12 12',
  'chevron-left': 'm15 18-6-6 6-6',
  'chevron-right': 'm9 18 6-6-6-6',
  images: 'M3 3h18v18H3zm0 13 5-5 4 4 3-3 6 6M15.5 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(20);
  protected readonly path = computed(() => ICONS[this.name()] ?? '');
}
