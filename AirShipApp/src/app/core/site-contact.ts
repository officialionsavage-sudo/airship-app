/** Defaults match legacy marketing copy; overridden via GET /api/site-settings keys below. */

export const SITE_CONTACT_DEFAULTS = {
  phone: '+20 114 484 1607',
  whatsappDisplay: '+20 114 484 1607',
  waDigits: '201144841607',
  email: 'info@airship.com',
  location: 'Hurghada, Red Sea, Egypt',
  /** Passed to Google Maps search query when opening location */
  mapsQuery: 'Hurghada, Egypt',
  hoursLines: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM', 'Sunday: Closed'] as const,
} as const;

export type ResolvedSiteContact = {
  phone: string;
  whatsappDisplay: string;
  email: string;
  location: string;
  mapsQuery: string;
  hoursLines: string[];
  waDigits: string;
};

function firstNonEmpty(map: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = map[k]?.trim();
    if (v) return v;
  }
  return '';
}

function digitsForWaMe(raw: string, fallbackDigits: string): string {
  const d = raw.replace(/\D/g, '');
  return d.length >= 8 ? d : fallbackDigits;
}

/**
 * Keys used by the public app:
 * - contact_phone
 * - contact_whatsapp (optional; falls back to phone then whatsapp_number)
 * - whatsapp_number (alternate key)
 * - contact_email
 * - contact_location
 * - contact_maps_query (optional; defaults to maps-friendly query)
 * - contact_hours_line_1 .. _3
 */
export function resolveSiteContact(map: Record<string, string>): ResolvedSiteContact {
  const phone = firstNonEmpty(map, ['contact_phone']) || SITE_CONTACT_DEFAULTS.phone;
  const whatsappDisplay =
    firstNonEmpty(map, ['contact_whatsapp', 'whatsapp_number']) || phone;
  const email = firstNonEmpty(map, ['contact_email']) || SITE_CONTACT_DEFAULTS.email;
  const location = firstNonEmpty(map, ['contact_location']) || SITE_CONTACT_DEFAULTS.location;
  const mapsQuery =
    firstNonEmpty(map, ['contact_maps_query']) ||
    location ||
    SITE_CONTACT_DEFAULTS.mapsQuery;

  const hoursLines = [
    firstNonEmpty(map, ['contact_hours_line_1']) || SITE_CONTACT_DEFAULTS.hoursLines[0],
    firstNonEmpty(map, ['contact_hours_line_2']) || SITE_CONTACT_DEFAULTS.hoursLines[1],
    firstNonEmpty(map, ['contact_hours_line_3']) || SITE_CONTACT_DEFAULTS.hoursLines[2],
  ];

  const waSource =
    firstNonEmpty(map, ['contact_whatsapp', 'whatsapp_number']) ||
    firstNonEmpty(map, ['contact_phone']) ||
    phone;
  const waDigits = digitsForWaMe(waSource, SITE_CONTACT_DEFAULTS.waDigits);

  return { phone, whatsappDisplay, email, location, mapsQuery, hoursLines, waDigits };
}
