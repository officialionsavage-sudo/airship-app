/** Parse API timestamps and calendar dates for admin display. */
function toDate(value: string | number | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Date + time in the admin user's locale, with a short timezone name (e.g. EEST, GMT+2).
 * Example: `May 15, 2026, 3:45 PM EEST`
 */
export function formatAdminDateTime(
  value: string | number | Date | null | undefined,
  placeholder = '—',
): string {
  if (value == null || value === '') {
    return placeholder;
  }
  const d = toDate(value);
  if (!d) {
    return typeof value === 'string' ? value : placeholder;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZoneName: 'short',
  }).format(d);
}

/** Calendar date only (no time), e.g. booking check-in `YYYY-MM-DD`. */
export function formatAdminDate(value: string | null | undefined, placeholder = '—'): string {
  if (value == null || value.trim() === '') {
    return placeholder;
  }
  const d = toDate(value);
  if (!d) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
}
