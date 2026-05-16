import { apiUrl } from './api-url';

/** Value bound to catalog/CMS image fields (https URL, legacy data URI, or `/media/…`). */
export function resolveAdminImagePreviewSrc(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (v.startsWith('data:image/')) return v;
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.startsWith('/media/')) return apiUrl(v);
  if (v.startsWith('/') || v.startsWith('assets/')) return v;
  return '';
}
