import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeStoredImagePayload } from '../src/image-encoding.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** ~200 bytes — use with SEED_TINY=1 on small Railway volumes. */
export const TINY_SEED_IMG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

function useTinySeedImages(): boolean {
  return process.env.SEED_TINY === '1' || process.env.SEED_TINY === 'true';
}

/**
 * Load a seed catalog image: full data URI from `seed-images/img{n}.b64`
 * (file may contain `data:image/jpeg;base64,...`, `data:image/webp;base64,...`, or raw base64 only).
 */
export function loadSeedImg(n: 1 | 2 | 3 | 4 | 5): string {
  if (useTinySeedImages()) return TINY_SEED_IMG;
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
