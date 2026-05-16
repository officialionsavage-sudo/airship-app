/** Three portal tiles on `/city/:slug` (real estate, tours, transportation). */
export interface CityPortalCard {
  title: string;
  description: string;
  image: string;
}

export interface City {
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
  heroImage: string;
  isComingSoon: boolean;
  portals: {
    realEstate: CityPortalCard;
    tours: CityPortalCard;
    transport: CityPortalCard;
  };
}

export type ProjectStatus = 'launching' | 'under-construction' | 'ready';
export type PropertyType = 'apartment' | 'villa' | 'townhouse' | 'chalet' | 'studio';

/** Public listing filter option (`GET /api/cities/:slug/location-filters` or `.../tour-type-filters`). */
export interface CatalogListingFilter {
  title: string;
  slug: string;
}

/** @deprecated Use `CatalogListingFilter` — name kept for gradual refactors. */
export type LocationFilter = CatalogListingFilter;

export type TourType = 'sea' | 'desert' | 'island' | 'city' | 'adventure' | 'wellness';

/** Tour listing filter row for a city (same shape as real-estate filters). */
export type TourTypeFilterOption = CatalogListingFilter;

export interface UnitDiscounts {
  day: number;
  week: number;
  month: number;
}

export interface Unit {
  id: string;
  slug: string;
  projectSlug: string;
  title: string;
  images: string[];
  size: number;
  beds: number;
  baths: number;
  description: string;
  features: string[];
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  discounts: UnitDiscounts;
}

export interface Project {
  id: string;
  slug: string;
  citySlug: string;
  title: string;
  startingPrice?: number;
  locationName: string;
  locationSlug: string;
  /** Slugs of city real-estate catalog filters assigned to this project (public listing). */
  catalogFilterSlugs: string[];
  status: ProjectStatus;
  propertyType: PropertyType;
  description: string;
  shortDescription: string;
  images: string[];
  heroImage: string;
  features: string[];
  amenities: string[];
  developerName: string;
  deliveryDate: string;
  mapEmbedUrl: string;
  videoUrl: string;
  units: Unit[];
}

export interface TourPrice {
  label: 'Adult' | 'Child 3-12' | 'Infant 0-2';
  amount: number;
  discountPercent: number;
}

export interface Tour {
  id: string;
  slug: string;
  citySlug: string;
  title: string;
  type: TourType;
  rating: number;
  startPrice: number;
  duration: string;
  departureTime: string;
  groupSize: string;
  overview: string;
  images: string[];
  itinerary: string[];
  included: string[];
  notIncluded: string[];
  prices: TourPrice[];
  /** Slugs of city tour catalog filters assigned to this tour (public listing). */
  catalogFilterSlugs: string[];
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  images: string[];
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  highlights: string[];
  features: string[];
  included: string[];
  notIncluded: string[];
  terms: string | null;
  validUntil: string | null;
}

/** Approved review returned by GET /api/reviews (public carousel). */
export interface PublicReview {
  id: string;
  name: string;
  citySlug: string;
  text: string;
  rating: number;
  role: string;
}

export interface ReviewSubmitRequest {
  targetType: 'app' | 'service' | 'tour' | 'project';
  targetSlug?: string;
  name: string;
  email?: string;
  text: string;
  rating: number;
  role?: string;
  citySlug?: string;
}

export interface BookingRequest {
  fullName: string;
  phone: string;
  email?: string;
  citySlug: string;
  relatedSlug: string;
  bookingType: 'property' | 'tour' | 'offer';
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  notes?: string;
}

export interface ContactRequest {
  fullName: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}
