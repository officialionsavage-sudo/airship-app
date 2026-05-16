/**
 * Optional: paste five blocks into seed-images-source.md (same shape as a chat paste),
 * then run from AirShipBackend/: node prisma/split-seed-images.mjs
 *
 * Handles both `N- ```\\n` and `4- ```data:image...` (no newline after fence).
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdPath = join(__dirname, 'seed-images-source.md');
const outDir = join(__dirname, 'seed-images');

const text = readFileSync(mdPath, 'utf8');

const patterns = [
  /1- ```\s*\n(data:image\/jpeg;base64,.*?)\s*(?=\n2- ```)/s,
  /2- ```\s*\n(data:image\/jpeg;base64,.*?)\s*(?=\n3- ```)/s,
  /3- ```\s*\n(data:image\/jpeg;base64,.*?)\s*(?=\n4- ```)/s,
  /4- ```\s*(data:image\/jpeg;base64,.*?)\s*(?=\n5- ```)/s,
  /5- ```\s*\n(data:image\/jpeg;base64,.*?)\s*```/s,
];

const imgs = [];
for (const p of patterns) {
  const m = text.match(p);
  if (!m) {
    console.error('Missing image block for pattern:', String(p).slice(0, 60));
    process.exit(1);
  }
  imgs.push(m[1].trim().replace(/\s+/g, ''));
}

mkdirSync(outDir, { recursive: true });
for (let i = 0; i < imgs.length; i++) {
  const fp = join(outDir, `img${i + 1}.b64`);
  writeFileSync(fp, imgs[i], 'utf8');
  console.log(`Wrote ${fp} (${imgs[i].length} chars)`);
}
