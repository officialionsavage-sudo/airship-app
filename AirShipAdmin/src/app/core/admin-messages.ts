/** Plain-language defaults when the API doesn’t return a specific message. */

export const ADMIN_MSG = {
  loadList: 'We couldn’t load this list. Check your connection and try again.',
  loadDetail: 'We couldn’t open that item. Try again or choose another.',
  save: 'Your changes couldn’t be saved. Check the form and try again.',
  delete: 'That item couldn’t be deleted. Try again.',
  loadPicklists: 'We couldn’t load the lists needed for this form. Refresh the page or try again.',
  galleryJson: 'Photo list format isn’t valid. Use the upload buttons or ask support for help.',
  galleryMax: 'At most 10 images allowed. Remove one before adding another.',
  pricesInvalid: 'Each price needs a label and a valid amount.',
  generic: 'Something went wrong. Please try again.',
} as const;

/** Prefer server `error` string when present (often readable validation text). */
export function adminApiErrorMessage(error: unknown, fallback: string): string {
  const msg = (error as { error?: { error?: unknown } })?.error?.error;
  if (typeof msg === 'string' && msg.trim()) {
    return msg.trim();
  }
  return fallback;
}
