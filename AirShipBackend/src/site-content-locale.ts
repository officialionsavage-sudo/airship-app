import type { SupportedLocale } from './locale.js';

const FALLBACK_ORDER: SupportedLocale[] = ['en', 'ar', 'de', 'ru'];

/** For `home` key: if payload is `{ version: 2, locales: { … } }`, return branch for `locale` with fallback. */
export function localizeSiteContentPayload(key: string, payload: unknown, locale: SupportedLocale): unknown {
  if (key !== 'home' || payload == null || typeof payload !== 'object') {
    return payload;
  }
  const root = payload as { version?: number; locales?: Partial<Record<SupportedLocale, unknown>> };
  if (!root.locales || typeof root.locales !== 'object') {
    return payload;
  }
  const locs = root.locales;
  const pick =
    (locales: Partial<Record<SupportedLocale, unknown>>, l: SupportedLocale): unknown | undefined =>
      locales[l];
  const direct = pick(locs, locale);
  if (direct != null && typeof direct === 'object') {
    return direct;
  }
  for (const fb of FALLBACK_ORDER) {
    const v = pick(locs, fb);
    if (v != null && typeof v === 'object') {
      return v;
    }
  }
  return {};
}
