import { getMediaPublicBaseUrl, MEDIA_URL_PREFIX } from './media-storage.js';

const DATA_URI = /^data:image\/[^;]+;base64,/i;
const LEGACY_PATH_OR_URL = /^(https?:\/\/|\/|assets\/)/;

/**
 * Strip accidental markdown fences (` ``` `) from pasted image payloads.
 * Handles ```lang\\n prefix and trailing ``` after paste from docs/chat.
 */
export function normalizeStoredImagePayload(stored: string): string {
  let s = stored.trim();
  if (!s) return '';
  s = s.replace(/^```(?:[a-zA-Z0-9_-]*)?\s*\n?/, '');
  s = s.replace(/\s*```\s*$/, '');
  return s.trim();
}

/** Deep-walk CMS JSON and strip ``` fences from strings that look like pasted image data. */
export function sanitizePossiblyPastedImageStrings(payload: unknown): unknown {
  if (payload === null || typeof payload !== 'object') {
    if (typeof payload === 'string') {
      const s = payload;
      if (s.includes('```') || /\bdata:image\/[^;]+;base64,/i.test(s)) {
        return normalizeStoredImagePayload(s);
      }
    }
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map(sanitizePossiblyPastedImageStrings);
  }
  const obj = payload as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    out[key] = sanitizePossiblyPastedImageStrings(obj[key]);
  }
  return out;
}

/**
 * Turn DB-stored image payloads into a string usable as `<img src>`.
 * Accepts full data URIs, legacy relative URLs (`assets/…`), http(s), or raw base64 bodies (wrapped as JPEG).
 */
export function decodeStoredImageForWeb(stored: string): string {
  const s = normalizeStoredImagePayload(stored);
  if (!s) return '';
  if (DATA_URI.test(s)) return s;
  if (s.startsWith(MEDIA_URL_PREFIX + '/')) {
    return `${getMediaPublicBaseUrl()}${s}`;
  }
  if (LEGACY_PATH_OR_URL.test(s)) return s;
  return `data:image/jpeg;base64,${s.replace(/\s/g, '')}`;
}

export function decodeStoredImagesForWeb(entries: string[]): string[] {
  return entries.map(decodeStoredImageForWeb);
}
