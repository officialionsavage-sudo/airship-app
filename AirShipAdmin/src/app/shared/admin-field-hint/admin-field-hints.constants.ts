/** Shared tooltip copy for admin forms (catalog + CMS). */

export const CITY_HINTS = {
  slug: 'URL segment: lowercase letters, numbers, hyphens. Must stay unique. Used in public city URLs.',
  title: 'Display name shown on cards and headings.',
  shortDescription: 'Short teaser text on city cards (keep concise).',
  cardImage: 'Card thumbnail on the cities grid. Stored as data URI or URL for the API.',
  heroImage: 'Large hero visual on the city landing area.',
  comingSoon: 'When checked, the city can be shown as “coming soon” in the public UI depending on layout.',
  sortOrder: 'Lower numbers appear first when the API orders cities by sortOrder.',
  portalSection:
    'The three tiles on the public city page (projects list, tours list, transfers). Leave image empty to reuse card image (real estate + transport) or hero image (tours).',
  portalRealEstateTitle: 'Heading on the Real Estate portal tile.',
  portalRealEstateDescription: 'Body text under that heading.',
  portalRealEstateImage: 'Background for that tile. Empty → uses main card image.',
  portalToursTitle: 'Heading on the Tours portal tile.',
  portalToursDescription: 'Body text under that heading.',
  portalToursImage: 'Background for that tile. Empty → uses hero image.',
  portalTransportTitle: 'Heading on the Transportation portal tile (links to /transfer).',
  portalTransportDescription: 'Body text under that heading.',
  portalTransportImage: 'Background for that tile. Empty → uses main card image.',
} as const;

export const LISTING_FILTERS_HINTS = {
  realEstate:
    'Create one row per tag (title + slug) for the city. Assign tags to each project in the project editor — the public listings page shows those tags and filters projects by assignment.',
  tours:
    'Create one row per dropdown bucket for the city. Assign buckets to each tour in the tour editor — the public tours page lists those buckets and filters tours by assignment (separate from the tour “type” field).',
} as const;

export const PROJECT_HINTS = {
  slug: 'Unique project slug in URLs. Lowercase, hyphens only.',
  citySlug: 'Must exactly match an existing city slug from Cities.',
  title: 'Marketing title shown on listings and detail.',
  startingPrice: 'Optional headline price (integer). Display logic lives in the public app.',
  locationName: 'Human-readable area label (e.g. district name).',
  locationSlug:
    'Legacy grouping slug; keep in sync with a real-estate catalog filter slug when possible. Listing chips use catalog assignments on the project.',
  status: 'launching · under-construction · ready — affects badges and filters.',
  propertyType: 'Used for icons/filters on the public site.',
  shortDescription: 'Short teaser on cards.',
  description: 'Full narrative body on the project page.',
  gallery: 'Ordered gallery images. Upload each slot — files are stored on your API server as URLs.',
  heroImage: 'Primary hero image for the project detail header.',
  features: 'Bullet-style lines (one input per line). Stored as string[].',
  amenities: 'Same as features — amenity labels one per line.',
  developerName: 'Developer label shown in project meta.',
  deliveryDate: 'Expected completion date (YYYY-MM-DD) or leave empty for null.',
  mapEmbedUrl: 'Full embed URL or map link shown on the project page.',
  videoUrl: 'Promo or walkthrough video URL.',
} as const;

export const UNIT_HINTS = {
  slug: 'Unique across all units. Used in booking/deep links.',
  title: 'Unit name shown in lists and detail.',
  gallery: 'Unit-specific photos (same rules as project gallery).',
  size: 'Area number as shown to users (e.g. square meters).',
  beds: 'Bedroom count.',
  baths: 'Bathroom count.',
  description: 'Long description for the unit.',
  features: 'Feature lines, one per row.',
  pricePerDay: 'Base daily rate (integer).',
  pricePerWeek: 'Weekly rate.',
  pricePerMonth: 'Monthly rate.',
  discountDay: 'Discount percent off daily rate (0–100).',
  discountWeek: 'Discount percent off weekly rate.',
  discountMonth: 'Discount percent off monthly rate.',
} as const;

export const TOUR_HINTS = {
  slug: 'Unique tour slug for URLs.',
  citySlug: 'Existing city slug this tour belongs under.',
  title: 'Tour marketing title.',
  type: 'Category used for filtering (sea, desert, city, etc.).',
  rating: 'Average rating shown on cards (0–5).',
  startPrice: 'From-price headline amount.',
  duration: 'Human-readable duration text.',
  departureTime: 'Typical departure time description.',
  groupSize: 'Typical group size text.',
  overview: 'Long overview body.',
  gallery: 'Tour photo gallery.',
  itinerary: 'Ordered steps; one line per stop or segment.',
  included: 'Included items; one per line.',
  notIncluded: 'Excluded items; one per line.',
  prices: 'Ticket tiers: label, amount (minor units / whole currency unit per your pricing rules), discount %.',
} as const;

export const OFFER_HINTS = {
  title: 'Headline on the offer card and detail page.',
  description: 'Main overview paragraph on the detail page.',
  oldPrice: 'Original price (integer).',
  newPrice: 'Promotional price.',
  discountPercent: 'Badge percent (0–100).',
  sortOrder: 'Lower sorts earlier in offer lists.',
  images: 'One or more images for the card gallery.',
  highlights: 'Short chips under the title (e.g. “Limited time”, “Marina front”).',
  features: 'Bullet list of key selling points.',
  included: 'What the guest gets — one item per line.',
  notIncluded: 'Exclusions — one item per line.',
  terms: 'Optional fine print shown at the bottom of the detail page.',
  validUntil: 'Optional end date for the promotion (YYYY-MM-DD). Leave empty if open-ended.',
} as const;

export const VEHICLE_TYPE_HINTS = {
  label: 'Shown in the public Transfer form vehicle dropdown.',
  sortOrder: 'Lower numbers appear first in the dropdown.',
} as const;

export const CAR_HINTS = {
  slug: 'Stable URL key (lowercase, hyphens). Must be unique.',
  name: 'Vehicle label shown in the transfer picker.',
  type: 'Category text (e.g. Sedan, SUV, Van).',
  passengers: 'Maximum passenger count shown to guests.',
  luggage: 'Luggage capacity hint (integer).',
  pricePerDay: 'Daily rental rate in EGP (integer).',
  sortOrder: 'Lower numbers appear first on GET /api/cars.',
  image: 'Thumbnail in car picker — data URI, HTTPS URL, or relative site path.',
} as const;

export const SITE_SETTING_HINTS = {
  key:
    'Stable machine key; exposed at GET /api/site-settings. Contact/WhatsApp: contact_phone, contact_whatsapp, contact_email, contact_location, contact_maps_query (optional), contact_hours_line_1..3.',
  value: 'Human-readable string for that key. Public app reads known keys for footer/contact blocks and WhatsApp.',
} as const;

/** Home CMS form — keys match sections for readability. */
export const HOME_HINTS = {
  heroKicker: 'Small uppercase line above the hero title.',
  heroTitlePrefix: 'First part of the animated hero title.',
  heroSubtitle: 'Supporting paragraph under the title.',
  heroTyping: 'Each line becomes one rotating phrase after the title prefix.',
  heroTypingAria: 'Accessible description for the typing animation.',
  heroLogoImage: 'Logo shown in the hero panel (right column on desktop, below copy on mobile).',
  heroLogoAlt: 'Alt text for the hero logo.',
  heroPrimaryCtaLabel: 'Primary button label.',
  heroPrimaryCtaHref: 'Anchor or path (e.g. #cities, /path).',
  heroSecondaryCtaLabel: 'Secondary button label.',
  heroSecondaryRouterLink: 'Angular router link path for secondary CTA.',
  heroSecondaryChip: 'Optional small chip text near secondary CTA.',
  heroScrollLabel: 'Label on the scroll-down cue.',
  heroScrollAria: 'Aria label for the scroll control.',
  citiesSectionTitle: 'Heading above the cities strip.',
  citiesSectionDesc: 'Intro copy for cities.',
  aboutKicker: 'Small label above about title.',
  aboutTitle: 'About section heading.',
  aboutLead: 'Lead paragraph.',
  aboutPointTitle: 'Title for a bullet point.',
  aboutPointBody: 'Body text for that point.',
  aboutStatValue: 'Bold metric (e.g. 12+).',
  aboutStatLabel: 'Label under the metric.',
  aboutCardBadge: 'Small badge on visual cards.',
  aboutCardTitle: 'Card title.',
  aboutCardSubtitle: 'Card subtitle.',
  testimonialsSectionTitle: 'Heading above the home reviews carousel.',
  testimonialsSectionDesc: 'Intro copy for the reviews section (approved visitor reviews).',
} as const;
