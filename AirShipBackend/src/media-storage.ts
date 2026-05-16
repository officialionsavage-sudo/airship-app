import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const MEDIA_URL_PREFIX = '/media';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

/** Root directory for uploaded files (Railway Volume or local `uploads/`). */
export function getMediaRoot(): string {
  const fromEnv = process.env.MEDIA_ROOT?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(backendRoot, fromEnv);
  }
  return path.join(backendRoot, 'uploads');
}

/** Public origin for absolute URLs stored in Postgres (no trailing slash). */
export function getMediaPublicBaseUrl(): string {
  const fromEnv = process.env.MEDIA_PUBLIC_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const port = process.env.PORT?.trim() || '3000';
  return `http://localhost:${port}`;
}

export function ensureMediaRoot(): void {
  fs.mkdirSync(getMediaRoot(), { recursive: true });
}

export function extensionForMime(mime: string): string {
  return MIME_EXT[mime.toLowerCase()] ?? '.bin';
}

export function isAllowedImageMime(mime: string): boolean {
  return mime.toLowerCase() in MIME_EXT;
}

/** Safe relative path under media root (e.g. `catalog/abc.jpg`). */
export function newMediaRelativePath(scope: string, mime: string): string {
  const safeScope = scope.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'misc';
  const ext = extensionForMime(mime);
  return path.posix.join(safeScope, `${Date.now()}-${randomUUID()}${ext}`);
}

export function buildPublicMediaUrl(relativePath: string): string {
  const rel = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${getMediaPublicBaseUrl()}${MEDIA_URL_PREFIX}/${rel}`;
}

/** Resolve a URL or `/media/...` path to an on-disk file for optional delete. */
export function resolveMediaFileFromStoredValue(stored: string): string | null {
  const s = stored.trim();
  if (!s) return null;

  let rel: string | null = null;
  if (s.startsWith(MEDIA_URL_PREFIX + '/')) {
    rel = s.slice(MEDIA_URL_PREFIX.length + 1);
  } else {
    const base = getMediaPublicBaseUrl();
    const prefix = `${base}${MEDIA_URL_PREFIX}/`;
    if (s.startsWith(prefix)) {
      rel = s.slice(prefix.length);
    }
  }
  if (!rel) return null;

  const normalized = path.posix.normalize(rel);
  if (normalized.startsWith('..') || path.posix.isAbsolute(normalized)) {
    return null;
  }

  const abs = path.join(getMediaRoot(), normalized);
  const root = path.resolve(getMediaRoot());
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    return null;
  }
  return abs;
}

export async function writeMediaFile(
  relativePath: string,
  buffer: Buffer,
): Promise<{ relativePath: string; url: string }> {
  ensureMediaRoot();
  const normalized = path.posix.normalize(relativePath.replace(/\\/g, '/'));
  if (normalized.startsWith('..') || path.posix.isAbsolute(normalized)) {
    throw new Error('Invalid media path');
  }
  const abs = path.join(getMediaRoot(), normalized);
  const dir = path.dirname(abs);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(abs, buffer);
  return { relativePath: normalized, url: buildPublicMediaUrl(normalized) };
}
