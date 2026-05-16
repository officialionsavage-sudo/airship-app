/** Country-code inclusive digits for wa.me (no +). */
const FALLBACK_WA_DIGITS = '201144841607';

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
  const stripped = (options?.waDigits ?? '').replace(/\D/g, '');
  const waDigits = stripped.length >= 8 ? stripped : FALLBACK_WA_DIGITS;

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

  return `https://wa.me/${waDigits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
