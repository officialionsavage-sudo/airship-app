import { apiUrl } from './api-url';

/** Value bound to catalog/CMS image fields (https URL, legacy data URI, or `/media/…`). */
export function resolveAdminImagePreviewSrc(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (v.startsWith('data:image/')) return v;
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const pathname = new URL(v).pathname;
      if (pathname.startsWith('/media/')) {
        return apiUrl(pathname);
      }
    } catch {
      /* fall through */
    }
    return v;
  }
  if (v.startsWith('/media/')) return apiUrl(v);
  if (v.startsWith('/') || v.startsWith('assets/')) return v;
  return '';
}

/** Short label for stored URL in admin UI. */
export function truncateAdminImageUrl(value: string, max = 72): string {
  const v = value.trim();
  if (!v) return '';
  if (v.length <= max) return v;
  return `${v.slice(0, max - 1)}…`;
}
