/**
 * Downloads every listing photo from Unsplash into public/photos so the app works offline and
 * images are served from the same origin (fast, cacheable, no third-party requests).
 *
 *   pnpm photos            # skip files that already exist
 *   pnpm photos --force    # download everything again
 *
 * Photos are free to use under the Unsplash License: https://unsplash.com/license
 */
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PHOTOS } from '../src/app/listings/photos.ts';

const OUT_DIR = join(import.meta.dirname, '..', 'public', 'photos');
// Every photo is cropped to 4:3, so any <img> can reserve the right box before it loads.
const WIDTHS = [800, 1600];
const force = process.argv.includes('--force');

await mkdir(OUT_DIR, { recursive: true });

const jobs = Object.values(PHOTOS).flatMap((id) =>
  WIDTHS.map((width) => ({ id, width, file: join(OUT_DIR, `${id}-${width}.webp`) })),
);

let downloaded = 0;
await Promise.all(
  jobs.map(async ({ id, width, file }) => {
    if (!force && existsSync(file)) return;
    const url = `https://images.unsplash.com/photo-${id}?fm=webp&fit=crop&w=${width}&h=${(width * 3) / 4}&q=72`;
    const res = await fetch(url);
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.startsWith('image/')) {
      throw new Error(`${url} → ${res.status} ${type}`);
    }
    await writeFile(file, new Uint8Array(await res.arrayBuffer()));
    downloaded++;
  }),
);

console.log(`photos: ${downloaded} downloaded, ${jobs.length - downloaded} already present`);
