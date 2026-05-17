import { SITE_CONTACT_DEFAULTS } from '../site-contact';

/** Country-code inclusive digits for wa.me (no +). */
function resolveWaDigits(waDigits?: string): string {
  const stripped = (waDigits ?? '').replace(/\D/g, '');
  return stripped.length >= 8 ? stripped : SITE_CONTACT_DEFAULTS.waDigits;
}

export function buildWhatsAppUrl(
  context: {
    fullName: string;
    phone: string;
    city?: string;
    interestType?: 'property' | 'tour' | 'general';
    relatedTitle?: string;
    travelDates?: string;
    guests?: number;
    budgetNote?: string;
    notes?: string;
  },
  options?: { waDigits?: string },
): string {
  const waDigits = resolveWaDigits(options?.waDigits);

  const lines = [
    'Hello AirShip Team,',
    '',
    'I would like assistance with a booking request.',
    `Name: ${context.fullName}`,
    `Phone: ${context.phone}`,
    `City: ${context.city ?? 'Not specified'}`,
    `Interest Type: ${context.interestType ?? 'general'}`,
    `Related Item: ${context.relatedTitle ?? 'Not specified'}`,
    `Travel Dates: ${context.travelDates ?? 'Flexible'}`,
    `Guests: ${context.guests ?? 'Not specified'}`,
    `Budget Notes: ${context.budgetNote ?? 'Will discuss'}`,
    `Additional Notes: ${context.notes ?? 'None'}`,
  ];

  return buildWhatsAppUrlFromLines(lines, options);
}

export function buildWhatsAppUrlFromLines(
  lines: string[],
  options?: { waDigits?: string },
): string {
  const waDigits = resolveWaDigits(options?.waDigits);
  return `https://wa.me/${waDigits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
