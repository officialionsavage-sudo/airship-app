import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeStoredImagePayload } from '../src/image-encoding.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load a seed catalog image: full data URI from `seed-images/img{n}.b64`
 * (file may contain `data:image/jpeg;base64,...`, `data:image/webp;base64,...`, or raw base64 only).
 */
export function loadSeedImg(n: 1 | 2 | 3 | 4 | 5): string {
  const path = join(__dirname, 'seed-images', `img${n}.b64`);
  if (!existsSync(path)) {
    throw new Error(
      `Missing ${path}. Run: cd AirShipBackend && node prisma/split-seed-images.mjs`
    );
  }
  let raw = normalizeStoredImagePayload(readFileSync(path, 'utf8')).replace(/\s+/g, '');
  if (raw.startsWith('data:')) return raw;
  return `data:image/jpeg;base64,${raw}`;
}
