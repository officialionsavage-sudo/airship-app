import type {
  City as DbCity,
  Offer as DbOffer,
  Project as DbProject,
  ProjectStatus,
  Review as DbReview,
  Tour as DbTour,
  TourPrice as DbTourPrice,
  Unit as DbUnit,
} from '@prisma/client';
import { decodeStoredImageForWeb, decodeStoredImagesForWeb } from './image-encoding.js';

/** Defaults when portal fields are blank (matches legacy city-details copy). */
export const CITY_PORTAL_DEFAULTS = {
  realEstate: {
    title: 'Real Estate Projects',
    description: 'Explore luxury resorts, investment opportunities, and coastal residences.',
  },
  tours: {
    title: 'Tours & Excursions',
    description: 'Book unforgettable sea trips, safaris, yacht cruises, and local experiences.',
  },
  transport: {
    title: 'Transportation',
    description: 'Airport transfers and car rentals—quick booking and fleet options.',
  },
} as const;

function portalTitle(raw: string | undefined, fallback: string): string {
  const t = raw?.trim();
  return t ? t : fallback;
}

function portalDescription(raw: string | undefined, fallback: string): string {
  const t = raw?.trim();
  return t ? t : fallback;
}

/** Decoded portal background; empty stored payload falls back to main city images. */
function portalImage(stored: string | undefined, fallbackStored: string): string {
  const decoded = decodeStoredImageForWeb(stored ?? '');
  return decoded.trim() ? decoded : decodeStoredImageForWeb(fallbackStored);
}

export function mapCity(c: DbCity) {
  const img = decodeStoredImageForWeb(c.imageBase64);
  const hero = decodeStoredImageForWeb(c.heroImageBase64);
  const d = CITY_PORTAL_DEFAULTS;
  return {
    title: c.title,
    slug: c.slug,
    shortDescription: c.shortDescription,
    image: img,
    heroImage: hero,
    isComingSoon: c.isComingSoon,
    portals: {
      realEstate: {
        title: portalTitle(c.portalRealEstateTitle, d.realEstate.title),
        description: portalDescription(c.portalRealEstateDescription, d.realEstate.description),
        image: portalImage(c.portalRealEstateImageBase64, c.imageBase64),
      },
      tours: {
        title: portalTitle(c.portalToursTitle, d.tours.title),
        description: portalDescription(c.portalToursDescription, d.tours.description),
        image: portalImage(c.portalToursImageBase64, c.heroImageBase64),
      },
      transport: {
        title: portalTitle(c.portalTransportTitle, d.transport.title),
        description: portalDescription(c.portalTransportDescription, d.transport.description),
        image: portalImage(c.portalTransportImageBase64, c.imageBase64),
      },
    },
  };
}

/** Public listing filter chip (`GET /api/cities/:slug/…-filters`). */
export function mapCatalogFilterPublic(f: { title: string; slug: string }) {
  return {
    title: f.title,
    slug: f.slug,
  };
}

function mapProjectStatus(s: ProjectStatus): 'launching' | 'under-construction' | 'ready' {
  if (s === 'under_construction') return 'under-construction';
  return s;
}

export function mapUnit(projectSlug: string, u: DbUnit) {
  return {
    id: u.id,
    slug: u.slug,
    projectSlug,
    title: u.title,
    images: decodeStoredImagesForWeb(u.images),
    size: u.size,
    beds: u.beds,
    baths: u.baths,
    description: u.description,
    features: u.features,
    pricePerDay: u.pricePerDay,
    pricePerWeek: u.pricePerWeek,
    pricePerMonth: u.pricePerMonth,
    discounts: {
      day: u.discountDay,
      week: u.discountWeek,
      month: u.discountMonth,
    },
  };
}

export type MapProjectInput = DbProject & {
  units: DbUnit[];
  city: { slug: string };
  catalogFilterLinks?: { catalogFilter: { slug: string } }[];
};

export type MapProjectListInput = DbProject & {
  city: { slug: string };
  catalogFilterLinks?: { catalogFilter: { slug: string } }[];
};

/** City project grid — hero + metadata only (no unit galleries). */
export function mapProjectListItem(p: MapProjectListInput) {
  const fromLinks = p.catalogFilterLinks?.map((l) => l.catalogFilter.slug) ?? [];
  const catalogFilterSlugs = fromLinks.length > 0 ? fromLinks : p.locationSlug ? [p.locationSlug] : [];
  return {
    id: p.id,
    slug: p.slug,
    citySlug: p.city.slug,
    title: p.title,
    startingPrice: p.startingPrice ?? undefined,
    locationName: p.locationName,
    locationSlug: p.locationSlug,
    catalogFilterSlugs,
    status: mapProjectStatus(p.status),
    propertyType: p.propertyType,
    description: '',
    shortDescription: p.shortDescription,
    images: [] as string[],
    heroImage: decodeStoredImageForWeb(p.heroImageBase64),
    features: [] as string[],
    amenities: [] as string[],
    developerName: p.developerName,
    deliveryDate: p.deliveryDate ? p.deliveryDate.toISOString().slice(0, 10) : '',
    mapEmbedUrl: '',
    videoUrl: '',
    units: [],
  };
}

export function mapProject(p: MapProjectInput) {
  const fromLinks = p.catalogFilterLinks?.map((l) => l.catalogFilter.slug) ?? [];
  const catalogFilterSlugs = fromLinks.length > 0 ? fromLinks : p.locationSlug ? [p.locationSlug] : [];
  return {
    id: p.id,
    slug: p.slug,
    citySlug: p.city.slug,
    title: p.title,
    startingPrice: p.startingPrice ?? undefined,
    locationName: p.locationName,
    locationSlug: p.locationSlug,
    catalogFilterSlugs,
    status: mapProjectStatus(p.status),
    propertyType: p.propertyType,
    description: p.description,
    shortDescription: p.shortDescription,
    images: decodeStoredImagesForWeb(p.images),
    heroImage: decodeStoredImageForWeb(p.heroImageBase64),
    features: p.features,
    amenities: p.amenities,
    developerName: p.developerName,
    deliveryDate: p.deliveryDate ? p.deliveryDate.toISOString().slice(0, 10) : '',
    mapEmbedUrl: p.mapEmbedUrl,
    videoUrl: p.videoUrl,
    units: p.units.map((u) => mapUnit(p.slug, u)),
  };
}

export function mapTourPrice(p: DbTourPrice) {
  return {
    label: p.label as 'Adult' | 'Child 3-12' | 'Infant 0-2',
    amount: p.amount,
    discountPercent: p.discountPercent,
  };
}

export type MapTourInput = DbTour & {
  city: { slug: string };
  prices: DbTourPrice[];
  catalogFilterLinks?: { catalogFilter: { slug: string } }[];
};

/** Tour cards — first gallery image only. */
export function mapTourListItem(t: MapTourInput) {
  const prices = [...t.prices].sort((a, b) => a.label.localeCompare(b.label));
  const catalogFilterSlugs = t.catalogFilterLinks?.map((l) => l.catalogFilter.slug) ?? [];
  const decoded = decodeStoredImagesForWeb(t.images);
  return {
    id: t.id,
    slug: t.slug,
    citySlug: t.city.slug,
    title: t.title,
    type: t.type,
    rating: t.rating,
    startPrice: t.startPrice,
    duration: t.duration,
    departureTime: t.departureTime,
    groupSize: t.groupSize,
    overview: '',
    images: decoded.length > 0 ? [decoded[0]!] : [],
    itinerary: [] as string[],
    included: [] as string[],
    notIncluded: [] as string[],
    prices: prices.map(mapTourPrice),
    catalogFilterSlugs,
  };
}

export function mapTour(t: MapTourInput) {
  const prices = [...t.prices].sort((a, b) => a.label.localeCompare(b.label));
  const catalogFilterSlugs = t.catalogFilterLinks?.map((l) => l.catalogFilter.slug) ?? [];
  return {
    id: t.id,
    slug: t.slug,
    citySlug: t.city.slug,
    title: t.title,
    type: t.type,
    rating: t.rating,
    startPrice: t.startPrice,
    duration: t.duration,
    departureTime: t.departureTime,
    groupSize: t.groupSize,
    overview: t.overview,
    images: decodeStoredImagesForWeb(t.images),
    itinerary: t.itinerary,
    included: t.included,
    notIncluded: t.notIncluded,
    prices: prices.map(mapTourPrice),
    catalogFilterSlugs,
  };
}

/** Offers grid — first image + listing fields. */
export function mapOfferListItem(o: DbOffer) {
  const decoded = decodeStoredImagesForWeb(o.images ?? []);
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    images: decoded.length > 0 ? [decoded[0]!] : [],
    oldPrice: o.oldPrice,
    newPrice: o.newPrice,
    discountPercent: o.discountPercent,
    highlights: o.highlights ?? [],
    features: [] as string[],
    included: [] as string[],
    notIncluded: [] as string[],
    terms: null as string | null,
    validUntil: o.validUntil?.toISOString() ?? null,
  };
}

export function mapOffer(o: DbOffer) {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    images: decodeStoredImagesForWeb(o.images ?? []),
    oldPrice: o.oldPrice,
    newPrice: o.newPrice,
    discountPercent: o.discountPercent,
    highlights: o.highlights ?? [],
    features: o.features ?? [],
    included: o.included ?? [],
    notIncluded: o.notIncluded ?? [],
    terms: o.terms ?? null,
    validUntil: o.validUntil?.toISOString() ?? null,
  };
}

/** Public carousel / list — no email or moderation fields. */
export function mapPublicReview(r: DbReview) {
  return {
    id: r.id,
    name: r.name,
    citySlug: r.citySlug ?? '',
    text: r.text,
    rating: r.rating,
    role: r.role ?? '',
  };
}
