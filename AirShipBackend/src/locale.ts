import type { Request } from 'express';

export const SUPPORTED_LOCALES = ['en', 'ar', 'de', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = 'en';

function isSupportedLocale(v: string): v is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(v);
}

/** Parses `Accept-Language` (first tag) or `x-locale` query. */
export function resolveApiLocale(req: Request): SupportedLocale {
  const q = typeof req.query['x-locale'] === 'string' ? req.query['x-locale'].trim().toLowerCase() : '';
  if (q && isSupportedLocale(q)) {
    return q;
  }
  const raw = req.headers['accept-language'];
  if (typeof raw !== 'string' || !raw.trim()) {
    return DEFAULT_LOCALE;
  }
  const first = raw.split(',')[0]?.trim().split('-')[0]?.toLowerCase() ?? '';
  if (first && isSupportedLocale(first)) {
    return first;
  }
  return DEFAULT_LOCALE;
}
