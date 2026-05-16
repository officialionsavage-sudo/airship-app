import type { NavLinkDef, SiteShellContent } from './site-shell.models';

export const SITE_SHELL_DEFAULTS: SiteShellContent = {
  layout: {
    navbar: {
      brandLogoSrc: 'assets/images/horizontal-logo.png',
      brandAlt: 'AirShip logo',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Offers', path: '/offers' },
        { label: 'Transfer', path: '/transfer' },
        { label: 'Contact Us', path: '/contact-us' },
      ],
      menuOpenLabel: 'Close',
      menuCloseLabel: 'Menu',
    },
    footer: {
      logoSrc: 'assets/images/vertical-logo.png',
      logoAlt: 'AirShip logo',
      tagline: '© 2026 AirShip Egypt. Crafted for Red Sea luxury experiences.',
    },
    breadcrumb: {
      homeLabel: 'Home',
    },
  },
  pages: {
    offers: {
      pill: 'Seasonal Discounts',
      title: 'Special Offers',
      subtitle: 'Promotions and packages in one place — open any card for the full story and gallery.',
      discountAriaLabel: 'Discount',
      saveTag: 'Save',
      viewDealCta: 'View details',
      emptyErrorTitle: 'Error loading offers',
      emptyNoOffersTitle: 'No offers found',
      emptyNoOffersSubtitle: 'Check back soon for new promotions.',
    },
    transfer: {
      heroKicker: 'AirShip · Transfers',
      heroTitle: 'Move smoothly. Arrive relaxed.',
      heroSub: 'Airport transfers and car rentals across Red Sea cities—fast booking, clear options, direct support.',
      heroChipTitle: 'Instant WhatsApp',
      heroChipSub: 'Confirm details in minutes',
      tabsAriaLabel: 'Transfer type',
      tabAirport: 'Airport Transfer',
      tabCar: 'Car Rent',
      airportPanelTitle: 'Book Transfer With Us',
      airportPanelSub: 'Tell us your details—our team will confirm route, vehicle, and price.',
      carPanelTitle: 'Request Car Rental',
      carPanelSub:
        'Choose dates, pickup/dropoff, and select a car—pay and confirm after we contact you.',
      carsLoading: 'Loading vehicles…',
      carsError: 'Could not load vehicles. Try again later or contact us directly.',
      carsEmpty: 'No rental vehicles are configured yet.',
      contactAsideTitle: 'Contact details',
      businessHoursTitle: 'Business hours',
      asideNote: 'For fastest confirmation, message us on WhatsApp with your date + pickup point.',
      selectCarModalTitle: 'Select your car',
      selectCarModalPageLabel: '{{page}} / {{total}}',
      closeAriaLabel: 'Close',
      carTypeLabel: 'Car Type',
      selectCarPlaceholder: 'Select Car Type',
      paginationPrev: 'Prev',
      paginationNext: 'Next',
      successAirport: 'Request received! We’ll confirm your transfer shortly.',
      successCar: 'Request received! We’ll confirm your car rental shortly.',
      errorValidation: 'Please complete all required fields correctly.',
    },
    contact: {
      title: 'Contact Us',
      subtitle: "We're here to help with bookings, property questions, and custom travel plans.",
      formTitle: 'Send a Message',
      asideTitle: 'Get in touch',
      locationSectionTitle: 'Location',
      locationSubtitle: 'Serving destinations across Egypt',
      locationOpenButton: 'Open Location',
      waButton: 'WhatsApp Us',
      validationError: 'Please complete all required fields correctly.',
      sending: 'Sending...',
      sendButton: 'Send Message',
    },
    realEstateList: {
      titleTemplate: 'Real Estate Projects in {{city}}',
      subtitle:
        'Discover high-end coastal opportunities with premium facilities and strong investment potential.',
      locationFilterLabel: 'Location',
      locationAll: 'All Locations',
      facilitiesTemplate: '{{count}} Facilities',
      deliveryPrefix: 'Delivery ',
      viewDetailsCta: 'View Details',
      emptyErrorTitle: 'Error loading projects',
      emptyNoneTitle: 'No matching projects found',
      emptyNoneSubtitle: 'Try another location filter.',
    },
    toursList: {
      titleTemplate: 'Tours & Excursions in {{city}}',
      subtitle: 'Choose your perfect Red Sea journey from curated premium experiences.',
      tourTypeFilterLabel: 'Tour Type',
      emptyErrorTitle: 'Error loading tours',
      retryButton: 'Retry',
      emptyNoneTitle: 'No tours found',
      emptyNoneSubtitle: 'Try another filter type.',
      viewDetailsCta: 'View Details',
    },
    cityPortal: {
      realEstateIcon: '🏝️',
      realEstateTitle: 'Real Estate Projects',
      realEstateSubtitle:
        'Explore luxury resorts, investment opportunities, and coastal residences.',
      realEstateCta: 'Explore Projects',
      toursIcon: '🧭',
      toursTitle: 'Tours & Excursions',
      toursSubtitle:
        'Book unforgettable sea trips, safaris, yacht cruises, and local experiences.',
      toursCta: 'Explore Tours',
    },
    unitDetail: {
      bedsSuffix: ' Beds',
      bathsSuffix: ' Baths',
      sqmSuffix: ' sqm',
      unitFeaturesHeading: 'Unit Features',
      facilitiesHeading: 'Facilities',
      pricingHeading: 'Pricing Details',
      perDayLabel: 'Per Day',
      perWeekLabel: 'Per Week',
      perMonthLabel: 'Per Month',
      bookingTitle: 'Book Your Stay',
      bookingValidationError: 'Please complete required booking fields.',
      bookingSending: 'Booking...',
      bookNowButton: 'Book Now',
      whatsAppButton: 'WhatsApp Us',
    },
    projectDetail: {
      locationHeading: 'Location',
      locationHint: 'Open this destination in Google Maps for directions and nearby places.',
      openLocationButton: 'Open Location',
      facilitiesHeading: 'Facilities',
      featuresHeading: 'Features',
      unitsSectionTitle: 'Available Units',
      unitMetaTemplate: '{{size}} sqm · {{beds}} beds · {{baths}} baths',
      unitPricePrefix: 'From EGP ',
      unitPriceSuffix: ' / month',
      viewUnitCta: 'View Details',
    },
    tourDetail: {
      specialDealBadge: 'Special Deal',
      ratingSuffix: ' / 5',
      featuresHeading: 'Features',
      tagFlexible: 'Flexible support',
      tagPremium: 'Premium guide',
      itineraryHeading: 'Itinerary Timeline',
      includedHeading: "What's Included",
      notIncludedHeading: 'Not Included',
      pricingHeading: 'Pricing',
      adultLabel: 'Adult',
      childLabel: 'Child (3-12)',
      infantLabel: 'Infant (0-2)',
      bookingTitle: 'Book This Tour',
      totalPrefix: 'Total: EGP ',
      bookingValidationError: 'Please select a date before booking.',
      bookingSending: 'Booking...',
      bookNowButton: 'Book Now',
      whatsAppButton: 'WhatsApp Us',
    },
  },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export function deepMergeSiteShell(base: SiteShellContent, patch: unknown): SiteShellContent {
  if (!isPlainObject(patch)) {
    return structuredClone(base);
  }
  const out = structuredClone(base) as Record<string, unknown>;
  const stack: Array<{ base: Record<string, unknown>; patch: Record<string, unknown> }> = [
    { base: out, patch: patch as Record<string, unknown> },
  ];
  while (stack.length) {
    const { base: b, patch: p } = stack.pop()!;
    for (const key of Object.keys(p)) {
      const pv = p[key];
      const bv = b[key];
      if (pv === undefined) continue;
      if (isPlainObject(pv) && isPlainObject(bv)) {
        stack.push({ base: bv as Record<string, unknown>, patch: pv });
      } else {
        b[key] = pv;
      }
    }
  }
  return out as SiteShellContent;
}

export function sanitizeNavLinks(links: unknown): NavLinkDef[] | undefined {
  if (!Array.isArray(links)) return undefined;
  const out = links.filter((x): x is NavLinkDef => {
    if (!x || typeof x !== 'object') return false;
    const o = x as NavLinkDef;
    return (
      typeof o.label === 'string' &&
      typeof o.path === 'string' &&
      o.path.startsWith('/') &&
      !o.path.startsWith('//')
    );
  });
  return out.length ? out : undefined;
}

export function mergeSiteShellContent(api: unknown): SiteShellContent {
  const merged = deepMergeSiteShell(SITE_SHELL_DEFAULTS, api);
  const fixed = sanitizeNavLinks((merged as SiteShellContent).layout.navbar.links);
  if (fixed) {
    merged.layout.navbar.links = fixed;
  }
  return merged;
}

/** Replace `{{key}}` placeholders (ASCII keys). */
export function applyShellTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : '',
  );
}
