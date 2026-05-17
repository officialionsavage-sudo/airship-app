/** Snapshot of frontend fake data for Prisma seed — keep in sync manually if fixtures diverge. */

import { loadSeedImg } from './seed-images.loader.ts';

/** JPEG data URIs loaded from `prisma/seed-images/img{n}.b64` (not Angular asset paths). */
const IMG1 = loadSeedImg(1);
const IMG2 = loadSeedImg(2);
const IMG3 = loadSeedImg(3);
const IMG4 = loadSeedImg(4);
const IMG5 = loadSeedImg(5);

export const CITIES = [
  { title: 'Hurghada', slug: 'hurghada', shortDescription: 'Red Sea capital for luxury tourism and living.', image: IMG1, heroImage: IMG5, isComingSoon: false },
  { title: 'Sharm El Sheikh', slug: 'sharm-el-sheikh', shortDescription: 'Diving, nightlife, and high-end resorts.', image: IMG2, heroImage: IMG1, isComingSoon: false },
  { title: 'Safaga', slug: 'safaga', shortDescription: 'Quiet coast with diving and kitesurf escapes.', image: IMG3, heroImage: IMG4, isComingSoon: false },
  { title: 'Marsa Alam', slug: 'marsa-alam', shortDescription: 'Premium nature retreats and marine life.', image: IMG4, heroImage: IMG2, isComingSoon: false },
  { title: 'El Gouna', slug: 'el-gouna', shortDescription: 'Modern lagoon city with marina lifestyle.', image: IMG5, heroImage: IMG3, isComingSoon: false },
  { title: 'Makadi Bay', slug: 'makadi-bay', shortDescription: 'Family leisure and beachfront compounds.', image: IMG1, heroImage: IMG2, isComingSoon: false },
  { title: 'Sahl Hasheesh', slug: 'sahl-hasheesh', shortDescription: 'Elegant waterfront masterplan developments.', image: IMG2, heroImage: IMG5, isComingSoon: false },
  { title: 'Dahab', slug: 'dahab', shortDescription: 'Bohemian sea adventures and mountain views.', image: IMG3, heroImage: IMG1, isComingSoon: false },
  { title: 'Soma Bay', slug: 'soma-bay', shortDescription: 'Golf, kitesurf, and high-end beach resorts.', image: IMG4, heroImage: IMG5, isComingSoon: false },
  { title: 'Ras Ghareb', slug: 'ras-ghareb', shortDescription: 'Quiet coastal stop with open sea horizons.', image: IMG1, heroImage: IMG4, isComingSoon: false },
  { title: 'Nuweiba', slug: 'nuweiba', shortDescription: 'Laid-back Sinai coastline and desert backdrops.', image: IMG2, heroImage: IMG3, isComingSoon: true },
  { title: 'Ain Sokhna', slug: 'ain-sokhna', shortDescription: 'Closest Red Sea break from Cairo.', image: IMG4, heroImage: IMG3, isComingSoon: true },
  { title: 'Alexandria', slug: 'alexandria', shortDescription: 'Mediterranean heritage and urban tourism.', image: IMG5, heroImage: IMG4, isComingSoon: true },
];

/** Real-estate listing buckets — seed duplicates these rows for each Hurghada project (`projectId` in DB). */
export const HURGHADA_LOCATION_FILTERS = [
  { title: 'Makadi', slug: 'makadi' },
  { title: 'El Gouna', slug: 'el-gouna' },
  { title: 'Sahl Hasheesh', slug: 'sahl-hasheesh' },
  { title: 'Marina', slug: 'marina' },
  { title: 'Downtown', slug: 'downtown' },
  { title: 'Beachfront', slug: 'beachfront' },
];

/** Default tour listing buckets — seed applies per city slug (`listingCitySlug`); edit in Admin → Tour filters. */
export const DEFAULT_TOUR_TYPE_FILTERS_SEED = [
  { slug: 'water-sports', title: 'Water Sports', tourTypes: ['sea', 'island', 'wellness'] as const },
  { slug: 'safari', title: 'Safari & Desert', tourTypes: ['desert'] as const },
  { slug: 'adventure', title: 'Adventure', tourTypes: ['adventure'] as const },
  { slug: 'city-family', title: 'City & Family', tourTypes: ['city'] as const },
] as const;

const UNITS = [
  {
    id: 'u1', slug: 'azure-sky-loft', projectSlug: 'azure-cove', title: 'Azure Sky Loft', images: [IMG4, IMG1], size: 132, beds: 2, baths: 2,
    description: 'Glass-corner loft with marina panorama.', features: ['Smart lock', 'Sea balcony', 'Club access'],
    pricePerDay: 7200, pricePerWeek: 42000, pricePerMonth: 148000, discounts: { day: 10, week: 14, month: 22 }
  },
  {
    id: 'u2', slug: 'coral-signature-villa', projectSlug: 'coral-bay-estates', title: 'Coral Signature Villa', images: [IMG5, IMG2], size: 315, beds: 4, baths: 4,
    description: 'Private pool villa steps from coastline.', features: ['Infinity pool', 'Private parking', 'Rooftop lounge'],
    pricePerDay: 16500, pricePerWeek: 98000, pricePerMonth: 356000, discounts: { day: 8, week: 12, month: 20 }
  },
  {
    id: 'u3', slug: 'azure-marina-studio', projectSlug: 'azure-cove', title: 'Azure Marina Studio', images: [IMG1, IMG4], size: 64, beds: 1, baths: 1,
    description: 'Minimal studio with marina-side stroll access.', features: ['Marina access', 'Smart TV', 'Gym entry'],
    pricePerDay: 3900, pricePerWeek: 23000, pricePerMonth: 84000, discounts: { day: 9, week: 13, month: 20 }
  },
  {
    id: 'u4', slug: 'azure-family-suite', projectSlug: 'azure-cove', title: 'Azure Family Suite', images: [IMG2, IMG1], size: 168, beds: 3, baths: 2,
    description: 'Bright family suite with extra storage and lounge area.', features: ['Kids-friendly layout', 'Sea breeze balcony', 'Concierge access'],
    pricePerDay: 8600, pricePerWeek: 50500, pricePerMonth: 179000, discounts: { day: 8, week: 12, month: 20 }
  },
  {
    id: 'u5', slug: 'naama-bay-suite', projectSlug: 'sharm-horizon', title: 'Naama Bay Suite', images: [IMG2, IMG4], size: 148, beds: 2, baths: 2,
    description: 'Sea view residence with premium furnishing.', features: ['Hotel services', 'Sea balcony', 'Smart controls'],
    pricePerDay: 7900, pricePerWeek: 47000, pricePerMonth: 169000, discounts: { day: 7, week: 12, month: 19 }
  },
  {
    id: 'u6', slug: 'naama-studio-sunset', projectSlug: 'sharm-horizon', title: 'Naama Studio Sunset', images: [IMG1, IMG2], size: 72, beds: 1, baths: 1,
    description: 'Compact studio for quick stays near the bay.', features: ['Kitchenette', 'Balcony', 'High-speed Wi‑Fi'],
    pricePerDay: 4200, pricePerWeek: 24800, pricePerMonth: 92000, discounts: { day: 6, week: 10, month: 18 }
  },
  {
    id: 'u7', slug: 'lagoon-townhouse-elite', projectSlug: 'gouna-lagoon-lofts', title: 'Lagoon Townhouse Elite', images: [IMG5, IMG3], size: 210, beds: 3, baths: 3,
    description: 'Multi-level townhouse with private deck.', features: ['Private deck', 'Lagoon access', 'Covered parking'],
    pricePerDay: 9800, pricePerWeek: 59000, pricePerMonth: 218000, discounts: { day: 6, week: 10, month: 18 }
  },
  {
    id: 'u8', slug: 'lagoon-loft-duplex', projectSlug: 'gouna-lagoon-lofts', title: 'Lagoon Loft Duplex', images: [IMG3, IMG1], size: 165, beds: 2, baths: 2,
    description: 'Duplex loft with open-plan living and lagoon views.', features: ['Duplex layout', 'Private terrace', 'Marina shuttle'],
    pricePerDay: 8600, pricePerWeek: 51000, pricePerMonth: 189000, discounts: { day: 5, week: 10, month: 17 }
  },
  {
    id: 'u9', slug: 'makadi-family-chalet', projectSlug: 'makadi-pearl-bay', title: 'Makadi Family Chalet', images: [IMG4, IMG1], size: 120, beds: 2, baths: 2,
    description: 'Family chalet with garden terrace.', features: ['Garden terrace', 'Family resort access', 'Storage room'],
    pricePerDay: 6400, pricePerWeek: 38500, pricePerMonth: 139000, discounts: { day: 9, week: 13, month: 21 }
  },
  {
    id: 'u10', slug: 'makadi-poolside-studio', projectSlug: 'makadi-pearl-bay', title: 'Makadi Poolside Studio', images: [IMG2, IMG4], size: 58, beds: 1, baths: 1,
    description: 'Easy pool access studio with resort vibe.', features: ['Pool access', 'Resort services', 'Quiet building'],
    pricePerDay: 3600, pricePerWeek: 21000, pricePerMonth: 79000, discounts: { day: 8, week: 12, month: 20 }
  },
  {
    id: 'u11', slug: 'coral-garden-villa', projectSlug: 'coral-bay-estates', title: 'Coral Garden Villa', images: [IMG3, IMG5], size: 280, beds: 3, baths: 3,
    description: 'Garden-facing villa with shaded outdoor dining.', features: ['Garden terrace', 'Outdoor shower', 'Beach access'],
    pricePerDay: 13800, pricePerWeek: 82000, pricePerMonth: 298000, discounts: { day: 7, week: 11, month: 18 }
  },
  {
    id: 'u12', slug: 'coral-penthouse-skyline', projectSlug: 'coral-bay-estates', title: 'Coral Penthouse Skyline', images: [IMG5, IMG1], size: 240, beds: 3, baths: 3,
    description: 'Top-floor penthouse with panoramic sea horizon.', features: ['Rooftop lounge', 'Jacuzzi prep', 'Private elevator'],
    pricePerDay: 15500, pricePerWeek: 92000, pricePerMonth: 334000, discounts: { day: 6, week: 10, month: 17 }
  },
  {
    id: 'u17', slug: 'azure-sea-view-suite', projectSlug: 'azure-cove', title: 'Azure Sea View Suite', images: [IMG5, IMG2], size: 154, beds: 2, baths: 2,
    description: 'Suite with wide sea-facing balcony and lounge seating.', features: ['Sea view balcony', 'Smart AC', 'Concierge'],
    pricePerDay: 9200, pricePerWeek: 54500, pricePerMonth: 194000, discounts: { day: 7, week: 11, month: 19 }
  },
  {
    id: 'u18', slug: 'azure-penthouse-sunrise', projectSlug: 'azure-cove', title: 'Azure Penthouse Sunrise', images: [IMG1, IMG5], size: 226, beds: 3, baths: 3,
    description: 'Penthouse with sunrise terrace and open-plan living.', features: ['Sunrise terrace', 'Outdoor dining', 'Private entry'],
    pricePerDay: 14200, pricePerWeek: 86000, pricePerMonth: 312000, discounts: { day: 6, week: 10, month: 17 }
  },
  {
    id: 'u19', slug: 'coral-villa-royale', projectSlug: 'coral-bay-estates', title: 'Coral Villa Royale', images: [IMG2, IMG5], size: 360, beds: 5, baths: 5,
    description: 'Grand villa with generous outdoor lounge and shoreline feel.', features: ['Private pool', 'Chef kitchen', 'Gated entry'],
    pricePerDay: 21500, pricePerWeek: 129000, pricePerMonth: 468000, discounts: { day: 5, week: 9, month: 16 }
  },
  {
    id: 'u20', slug: 'gouna-loft-marina-edge', projectSlug: 'gouna-lagoon-lofts', title: 'Gouna Loft Marina Edge', images: [IMG5, IMG4], size: 138, beds: 2, baths: 2,
    description: 'Modern loft steps from marina lanes and cafés.', features: ['Marina edge', 'High ceilings', 'Smart lock'],
    pricePerDay: 7400, pricePerWeek: 44000, pricePerMonth: 162000, discounts: { day: 7, week: 11, month: 18 }
  },
  {
    id: 'u21', slug: 'makadi-chalet-beachfront', projectSlug: 'makadi-pearl-bay', title: 'Makadi Beachfront Chalet', images: [IMG4, IMG5], size: 128, beds: 2, baths: 2,
    description: 'Beachfront chalet with terrace and breezy living.', features: ['Beachfront', 'Terrace', 'Resort access'],
    pricePerDay: 7100, pricePerWeek: 42500, pricePerMonth: 152000, discounts: { day: 8, week: 12, month: 20 }
  },
  {
    id: 'u22', slug: 'sharm-family-residence', projectSlug: 'sharm-horizon', title: 'Sharm Family Residence', images: [IMG2, IMG1], size: 176, beds: 3, baths: 2,
    description: 'Family residence with hotel-style services and large balcony.', features: ['Hotel services', 'Kids-friendly', 'Sea breeze'],
    pricePerDay: 8800, pricePerWeek: 52500, pricePerMonth: 188000, discounts: { day: 7, week: 11, month: 18 }
  },
];

export const PROJECTS = [
  {
    id: 'p1', slug: 'azure-cove', citySlug: 'hurghada', title: 'Azure Cove Residences', startingPrice: 4200000, locationName: 'Marina', locationSlug: 'marina', status: 'under-construction', propertyType: 'apartment',
    description: 'Marina-facing branded residences with immersive amenities and curated concierge lifestyle.', shortDescription: 'Luxury apartments over Hurghada Marina.',
    images: [IMG1, IMG2, IMG4], heroImage: IMG1, features: ['Sea view decks', 'Smart homes', 'Private lounge'], amenities: ['Gym', 'Spa', 'Kids zone', 'Infinity pool'],
    developerName: 'Red Horizon Developments',
    mapEmbedUrl: 'https://maps.google.com/?q=Hurghada+Marina&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    units: UNITS.filter((unit) => unit.projectSlug === 'azure-cove'),
  },
  {
    id: 'p8', slug: 'soma-bay-pearl-residences', citySlug: 'soma-bay', title: 'Soma Bay Pearl Residences', startingPrice: 6900000, locationName: 'Soma Bay', locationSlug: 'soma-bay', status: 'launching', propertyType: 'apartment',
    description: 'Resort residences close to golf, beach clubs, and premium wellness facilities.', shortDescription: 'Luxury resort apartments in Soma Bay.',
    images: [IMG4, IMG2, IMG5], heroImage: IMG4, features: ['Beach club access', 'Golf proximity', 'Serviced living'], amenities: ['Spa', 'Gym', 'Infinity pool', 'Concierge'],
    developerName: 'Bayline Developments',
    mapEmbedUrl: 'https://maps.google.com/?q=Soma+Bay&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    units: [
      {
        id: 'u23', slug: 'soma-bay-1br-suite', projectSlug: 'soma-bay-pearl-residences', title: 'Soma Bay 1BR Suite', images: [IMG4, IMG1], size: 84, beds: 1, baths: 1,
        description: 'One-bedroom suite with resort views.', features: ['Resort view', 'Balcony', 'Hotel services'],
        pricePerDay: 5200, pricePerWeek: 31200, pricePerMonth: 118000, discounts: { day: 7, week: 11, month: 18 }
      },
      {
        id: 'u24', slug: 'soma-bay-2br-lagoon', projectSlug: 'soma-bay-pearl-residences', title: 'Soma Bay 2BR Lagoon', images: [IMG5, IMG2], size: 132, beds: 2, baths: 2,
        description: 'Lagoon-side two-bedroom with bright interiors.', features: ['Lagoon side', 'Kitchen island', 'Club access'],
        pricePerDay: 8400, pricePerWeek: 49800, pricePerMonth: 184000, discounts: { day: 6, week: 10, month: 17 }
      },
    ],
  },
  {
    id: 'p9', slug: 'marsa-alam-eco-shores', citySlug: 'marsa-alam', title: 'Eco Shores Marsa Alam', startingPrice: 4100000, locationName: 'Beachfront', locationSlug: 'beachfront', status: 'under-construction', propertyType: 'chalet',
    description: 'Nature-forward chalets designed for quiet retreats and marine excursions.', shortDescription: 'Eco-inspired chalets in Marsa Alam.',
    images: [IMG3, IMG4, IMG2], heroImage: IMG3, features: ['Low-density layout', 'Solar-ready', 'Nature trails'], amenities: ['Beach access', 'Yoga deck', 'Shuttle'],
    developerName: 'Green Tide',
    mapEmbedUrl: 'https://maps.google.com/?q=Marsa+Alam&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    units: [
      {
        id: 'u25', slug: 'eco-chalet-coral', projectSlug: 'marsa-alam-eco-shores', title: 'Eco Chalet Coral', images: [IMG3, IMG1], size: 98, beds: 2, baths: 2,
        description: 'Two-bed chalet steps from the beach path.', features: ['Beach path', 'Shaded patio', 'Quiet zone'],
        pricePerDay: 5200, pricePerWeek: 31000, pricePerMonth: 114000, discounts: { day: 8, week: 12, month: 20 }
      },
      {
        id: 'u26', slug: 'eco-studio-dune', projectSlug: 'marsa-alam-eco-shores', title: 'Eco Studio Dune', images: [IMG4, IMG2], size: 54, beds: 1, baths: 1,
        description: 'Minimal studio for solo retreats and dive trips.', features: ['Minimal design', 'Fast Wi‑Fi', 'Storage'],
        pricePerDay: 2900, pricePerWeek: 17200, pricePerMonth: 64000, discounts: { day: 9, week: 13, month: 21 }
      },
    ],
  },

  {
    id: 'p6', slug: 'hurghada-downtown-heights', citySlug: 'hurghada', title: 'Downtown Heights', startingPrice: 3600000, locationName: 'Downtown', locationSlug: 'downtown', status: 'ready', propertyType: 'studio',
    description: 'Urban studios and compact suites close to restaurants and transport.', shortDescription: 'Ready studios in Hurghada Downtown.',
    images: [IMG4, IMG1, IMG2], heroImage: IMG4, features: ['Walkable district', 'Work-from-home ready', 'Security'], amenities: ['Gym', 'Rooftop lounge', 'Co-working'],
    developerName: 'Blue Gate',
    mapEmbedUrl: 'https://maps.google.com/?q=Hurghada+Downtown&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    units: [
      {
        id: 'u13', slug: 'downtown-studio-plus', projectSlug: 'hurghada-downtown-heights', title: 'Downtown Studio Plus', images: [IMG4, IMG2], size: 52, beds: 1, baths: 1,
        description: 'Compact studio with dedicated work corner.', features: ['Work desk', 'Fast Wi‑Fi', 'City view'],
        pricePerDay: 2900, pricePerWeek: 16800, pricePerMonth: 64000, discounts: { day: 8, week: 12, month: 20 }
      },
      {
        id: 'u14', slug: 'downtown-loft-compact', projectSlug: 'hurghada-downtown-heights', title: 'Downtown Loft Compact', images: [IMG1, IMG4], size: 88, beds: 1, baths: 1,
        description: 'Loft vibe with mezzanine sleep area.', features: ['Loft layout', 'Kitchen island', 'Rooftop access'],
        pricePerDay: 4100, pricePerWeek: 24000, pricePerMonth: 89000, discounts: { day: 7, week: 11, month: 18 }
      },
    ],
  },

  {
    id: 'p3', slug: 'sharm-horizon', citySlug: 'sharm-el-sheikh', title: 'Sharm Horizon Residences', startingPrice: 5100000, locationName: 'Naama Bay', locationSlug: 'naama-bay', status: 'ready', propertyType: 'apartment',
    description: 'Panoramic serviced residences close to beaches and nightlife districts.', shortDescription: 'Ready serviced apartments in Sharm El Sheikh.',
    images: [IMG2, IMG1, IMG4], heroImage: IMG2, features: ['Sea-facing balconies', 'Hotel services', 'Smart AC control'], amenities: ['Gym', 'Pool', 'Concierge'],
    developerName: 'Sinai Gate Developments',
    mapEmbedUrl: 'https://maps.google.com/?q=Naama+Bay&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    units: UNITS.filter((unit) => unit.projectSlug === 'sharm-horizon'),
  },
  {
    id: 'p4', slug: 'gouna-lagoon-lofts', citySlug: 'el-gouna', title: 'Gouna Lagoon Lofts', startingPrice: 6200000, locationName: 'Abu Tig Marina', locationSlug: 'abu-tig-marina', status: 'launching', propertyType: 'townhouse',
    description: 'Lofts and townhouses around private lagoons with marina access.', shortDescription: 'Lagoon-facing homes in El Gouna.',
    images: [IMG5, IMG3, IMG1], heroImage: IMG5, features: ['Lagoon docks', 'Smart security', 'Solar-ready'], amenities: ['Beach club', 'Marina', 'Fitness zone'],
    developerName: 'Lagoon Axis',
    mapEmbedUrl: 'https://maps.google.com/?q=El+Gouna&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    units: UNITS.filter((unit) => unit.projectSlug === 'gouna-lagoon-lofts'),
  },
  {
    id: 'p5', slug: 'makadi-pearl-bay', citySlug: 'makadi-bay', title: 'Makadi Pearl Bay', startingPrice: 4500000, locationName: 'Makadi', locationSlug: 'makadi', status: 'under-construction', propertyType: 'chalet',
    description: 'Family-friendly chalets in an all-season resort district.', shortDescription: 'Modern chalets in Makadi Bay.',
    images: [IMG1, IMG4, IMG2], heroImage: IMG4, features: ['Resort access', 'Shuttle service', 'Family club'], amenities: ['Aqua park', 'Kids area', 'Medical center'],
    developerName: 'Coastal Nest',
    mapEmbedUrl: 'https://maps.google.com/?q=Makadi+Bay&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    units: UNITS.filter((unit) => unit.projectSlug === 'makadi-pearl-bay'),
  },
  {
    id: 'p2', slug: 'coral-bay-estates', citySlug: 'sahl-hasheesh', title: 'Coral Bay Estates', startingPrice: 9800000, locationName: 'Beachfront', locationSlug: 'beachfront', status: 'launching', propertyType: 'villa',
    description: 'Ultra-luxury gated villas combining tropical landscape design and private shoreline access.', shortDescription: 'Beachfront villas in Sahl Hasheesh.',
    images: [IMG5, IMG3, IMG2], heroImage: IMG5, features: ['Private beaches', 'Clubhouse', 'Security 24/7'], amenities: ['Marina access', 'Wellness center', 'Fine dining'],
    developerName: 'Nile Coast Holdings',
    mapEmbedUrl: 'https://maps.google.com/?q=Sahl+Hasheesh&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    units: UNITS.filter((unit) => unit.projectSlug === 'coral-bay-estates'),
  },

  {
    id: 'p7', slug: 'dahab-blue-ridge', citySlug: 'dahab', title: 'Dahab Blue Ridge', startingPrice: 3900000, locationName: 'Lagoon', locationSlug: 'lagoon', status: 'launching', propertyType: 'chalet',
    description: 'Low-rise chalets designed for remote work and sea sports lifestyle.', shortDescription: 'Chalets by Dahab Lagoon.',
    images: [IMG3, IMG2, IMG5], heroImage: IMG3, features: ['Breezy patios', 'Storage for gear', 'Community vibe'], amenities: ['Kite center', 'Café', 'Yoga deck'],
    developerName: 'South Sinai Living',
    mapEmbedUrl: 'https://maps.google.com/?q=Dahab+Lagoon&output=embed', videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    units: [
      {
        id: 'u15', slug: 'dahab-chalet-zen', projectSlug: 'dahab-blue-ridge', title: 'Dahab Chalet Zen', images: [IMG3, IMG5], size: 96, beds: 2, baths: 1,
        description: 'Simple, airy chalet with shaded patio.', features: ['Patio', 'Gear storage', 'Quiet lane'],
        pricePerDay: 4800, pricePerWeek: 28200, pricePerMonth: 106000, discounts: { day: 7, week: 11, month: 18 }
      },
      {
        id: 'u16', slug: 'dahab-loft-surf', projectSlug: 'dahab-blue-ridge', title: 'Dahab Loft Surf', images: [IMG2, IMG3], size: 118, beds: 2, baths: 2,
        description: 'Loft-style unit built for long stays and sports trips.', features: ['Work desk', 'Rinse station', 'Fast Wi‑Fi'],
        pricePerDay: 5600, pricePerWeek: 32800, pricePerMonth: 122000, discounts: { day: 6, week: 10, month: 17 }
      },
    ],
  },

  {
    id: 'p10',
    slug: 'safaga-marina-point',
    citySlug: 'safaga',
    title: 'Safaga Marina Point',
    startingPrice: 3350000,
    locationName: 'North Corniche',
    locationSlug: 'north-corniche',
    status: 'ready',
    propertyType: 'apartment',
    description:
      'Compact marina apartments with easy reef-day boating access and a relaxed coastal pace.',
    shortDescription: 'Ready apartments near Safaga marina.',
    images: [IMG1, IMG3, IMG4],
    heroImage: IMG1,
    features: ['Marina views', 'Quiet bay breeze', 'Day-trip boating'],
    amenities: ['Pool', 'Gym', 'Concierge desk'],
    developerName: 'Safaga Shoreline',
    mapEmbedUrl: 'https://maps.google.com/?q=Safaga+Egypt&output=embed',
    videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    units: [
      {
        id: 'u27',
        slug: 'safaga-marina-1br',
        projectSlug: 'safaga-marina-point',
        title: 'Safaga Marina 1BR',
        images: [IMG3, IMG4],
        size: 78,
        beds: 1,
        baths: 1,
        description: 'Corner one-bedroom with marina glimpses.',
        features: ['Corner layout', 'Balcony', 'Quiet floor'],
        pricePerDay: 4100,
        pricePerWeek: 24600,
        pricePerMonth: 92000,
        discounts: { day: 8, week: 12, month: 19 },
      },
      {
        id: 'u28',
        slug: 'safaga-marina-2br-corner',
        projectSlug: 'safaga-marina-point',
        title: 'Safaga Marina 2BR Corner',
        images: [IMG4, IMG1],
        size: 118,
        beds: 2,
        baths: 2,
        description: 'Bright two-bedroom with wrap balcony.',
        features: ['Wrap balcony', 'Open kitchen', 'Sea breeze'],
        pricePerDay: 6200,
        pricePerWeek: 37200,
        pricePerMonth: 138000,
        discounts: { day: 7, week: 11, month: 18 },
      },
    ],
  },
];

export const TOURS = [
  {
    id: 't1', slug: 'red-sea-diving-signature', citySlug: 'hurghada', title: 'Red Sea Diving Signature', type: 'sea', rating: 4.9, startPrice: 2200,
    duration: '6 hours', departureTime: '08:00 AM', groupSize: 'Up to 14 guests', overview: 'Yacht diving and snorkeling at premium reefs.',
    images: [IMG1, IMG2], itinerary: ['Hotel pickup', 'Yacht departure', 'Two dive spots', 'Sunset return'],
    included: ['Guide', 'Lunch', 'Equipment'], notIncluded: ['Photos', 'Tips'],
    prices: [
      { label: 'Adult', amount: 2200, discountPercent: 0 },
      { label: 'Child 3-12', amount: 1400, discountPercent: 15 },
      { label: 'Infant 0-2', amount: 500, discountPercent: 100 },
    ],
  },

  {
    id: 't6', slug: 'hurghada-island-hop', citySlug: 'hurghada', title: 'Hurghada Island Hop', type: 'island', rating: 4.7, startPrice: 2400,
    duration: '8 hours', departureTime: '08:30 AM', groupSize: 'Up to 20 guests', overview: 'Two island stops, snorkeling, and beach lunch.',
    images: [IMG4, IMG1], itinerary: ['Pickup', 'Boat departure', 'Island stop 1', 'Snorkeling stop', 'Island stop 2', 'Return'],
    included: ['Transport', 'Lunch', 'Snorkeling gear'], notIncluded: ['Photos', 'Tips'],
    prices: [
      { label: 'Adult', amount: 2400, discountPercent: 10 },
      { label: 'Child 3-12', amount: 1400, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 350, discountPercent: 100 },
    ],
  },

  {
    id: 't3', slug: 'sharm-royal-cruise', citySlug: 'sharm-el-sheikh', title: 'Sharm Royal Cruise', type: 'sea', rating: 4.8, startPrice: 2600,
    duration: '7 hours', departureTime: '09:00 AM', groupSize: 'Up to 18 guests', overview: 'Premium yacht cruise with snorkeling and lunch.',
    images: [IMG2, IMG5], itinerary: ['Marina departure', 'Snorkeling reef', 'Island stop', 'Sunset return'],
    included: ['Transport', 'Guide', 'Lunch'], notIncluded: ['Personal gear'],
    prices: [
      { label: 'Adult', amount: 2600, discountPercent: 12 },
      { label: 'Child 3-12', amount: 1500, discountPercent: 10 },
      { label: 'Infant 0-2', amount: 400, discountPercent: 100 },
    ],
  },
  {
    id: 't7', slug: 'sharm-desert-adventure', citySlug: 'sharm-el-sheikh', title: 'Sharm Desert Adventure', type: 'adventure', rating: 4.6, startPrice: 1650,
    duration: '5 hours', departureTime: '04:00 PM', groupSize: 'Up to 22 guests', overview: 'ATV ride, canyon viewpoints, and Bedouin tea stop.',
    images: [IMG3, IMG2], itinerary: ['Pickup', 'Safety briefing', 'ATV ride', 'Canyon stop', 'Bedouin tea', 'Return'],
    included: ['Guide', 'Helmet', 'Transport'], notIncluded: ['Scarf rental', 'Personal expenses'],
    prices: [
      { label: 'Adult', amount: 1650, discountPercent: 12 },
      { label: 'Child 3-12', amount: 950, discountPercent: 10 },
      { label: 'Infant 0-2', amount: 250, discountPercent: 100 },
    ],
  },
  {
    id: 't4', slug: 'gouna-water-sports-day', citySlug: 'el-gouna', title: 'Gouna Water Sports Day', type: 'wellness', rating: 4.6, startPrice: 1900,
    duration: '5 hours', departureTime: '10:00 AM', groupSize: 'Up to 16 guests', overview: 'Kite, paddle, and lagoon adventure package.',
    images: [IMG5, IMG1], itinerary: ['Pickup', 'Water activity sessions', 'Lagoon chill stop', 'Return'],
    included: ['Instructor', 'Equipment', 'Hydration'], notIncluded: ['Private photo shoot'],
    prices: [
      { label: 'Adult', amount: 1900, discountPercent: 8 },
      { label: 'Child 3-12', amount: 1100, discountPercent: 5 },
      { label: 'Infant 0-2', amount: 200, discountPercent: 100 },
    ],
  },
  {
    id: 't8', slug: 'gouna-marina-city-walk', citySlug: 'el-gouna', title: 'Gouna Marina City Walk', type: 'city', rating: 4.5, startPrice: 850,
    duration: '3 hours', departureTime: '05:30 PM', groupSize: 'Up to 16 guests', overview: 'A relaxed sunset walk with photo spots and café stop.',
    images: [IMG5, IMG2], itinerary: ['Meet at marina', 'Lagoon bridge viewpoints', 'Market lane', 'Café stop', 'Wrap-up'],
    included: ['Local guide', 'Bottled water'], notIncluded: ['Snacks', 'Personal purchases'],
    prices: [
      { label: 'Adult', amount: 850, discountPercent: 10 },
      { label: 'Child 3-12', amount: 480, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 100, discountPercent: 100 },
    ],
  },
  {
    id: 't5', slug: 'makadi-family-splash', citySlug: 'makadi-bay', title: 'Makadi Family Splash', type: 'city', rating: 4.5, startPrice: 1300,
    duration: '4 hours', departureTime: '11:00 AM', groupSize: 'Up to 25 guests', overview: 'Family package with beach games and mini safari ride.',
    images: [IMG4, IMG2], itinerary: ['Resort meetup', 'Beach activities', 'Mini desert track', 'Family meal'],
    included: ['Guide', 'Snacks', 'Transport'], notIncluded: ['Souvenirs'],
    prices: [
      { label: 'Adult', amount: 1300, discountPercent: 10 },
      { label: 'Child 3-12', amount: 750, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 150, discountPercent: 100 },
    ],
  },
  {
    id: 't9', slug: 'makadi-wellness-beach-yoga', citySlug: 'makadi-bay', title: 'Makadi Wellness Beach Yoga', type: 'wellness', rating: 4.8, startPrice: 950,
    duration: '2 hours', departureTime: '07:00 AM', groupSize: 'Up to 18 guests', overview: 'Sunrise yoga + healthy breakfast by the beach.',
    images: [IMG2, IMG4], itinerary: ['Meet at beach', 'Breathing warm-up', 'Yoga session', 'Breakfast', 'Free time'],
    included: ['Instructor', 'Mat', 'Breakfast'], notIncluded: ['Transport', 'Spa services'],
    prices: [
      { label: 'Adult', amount: 950, discountPercent: 8 },
      { label: 'Child 3-12', amount: 550, discountPercent: 5 },
      { label: 'Infant 0-2', amount: 120, discountPercent: 100 },
    ],
  },
  {
    id: 't2', slug: 'desert-star-safari', citySlug: 'sahl-hasheesh', title: 'Desert Star Safari', type: 'desert', rating: 4.7, startPrice: 1500,
    duration: '4 hours', departureTime: '03:30 PM', groupSize: 'Up to 20 guests', overview: 'Sunset dunes convoy with Bedouin dinner.',
    images: [IMG3, IMG4], itinerary: ['Resort pickup', 'Quad ride', 'Bedouin camp', 'Show and dinner'],
    included: ['Transport', 'Guide', 'Dinner'], notIncluded: ['Scarf rental'],
    prices: [
      { label: 'Adult', amount: 1500, discountPercent: 10 },
      { label: 'Child 3-12', amount: 900, discountPercent: 10 },
      { label: 'Infant 0-2', amount: 250, discountPercent: 100 },
    ],
  },
  {
    id: 't10', slug: 'dahab-blue-hole-day', citySlug: 'dahab', title: 'Dahab Blue Hole Day', type: 'sea', rating: 4.9, startPrice: 2800,
    duration: '9 hours', departureTime: '07:30 AM', groupSize: 'Up to 12 guests', overview: 'Signature snorkeling day with lagoon stop and photo time.',
    images: [IMG3, IMG5], itinerary: ['Early pickup', 'Blue Hole stop', 'Lagoon chill', 'Lunch stop', 'Return'],
    included: ['Transport', 'Guide', 'Lunch'], notIncluded: ['Diving upgrade', 'Tips'],
    prices: [
      { label: 'Adult', amount: 2800, discountPercent: 10 },
      { label: 'Child 3-12', amount: 1600, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 350, discountPercent: 100 },
    ],
  },
  {
    id: 't11', slug: 'marsa-alam-dolphin-quest', citySlug: 'marsa-alam', title: 'Marsa Alam Dolphin Quest', type: 'sea', rating: 4.8, startPrice: 2400,
    duration: '8 hours', departureTime: '08:00 AM', groupSize: 'Up to 18 guests', overview: 'Boat trip to renowned dolphin spots with snorkeling and lunch.',
    images: [IMG4, IMG3], itinerary: ['Pickup', 'Marina departure', 'Dolphin spot', 'Snorkeling', 'Lunch', 'Return'],
    included: ['Transport', 'Lunch', 'Snorkeling gear'], notIncluded: ['Photos', 'Tips'],
    prices: [
      { label: 'Adult', amount: 2400, discountPercent: 10 },
      { label: 'Child 3-12', amount: 1400, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 300, discountPercent: 100 },
    ],
  },
  {
    id: 't12', slug: 'safaga-reef-snorkel', citySlug: 'safaga', title: 'Safaga Reef Snorkel', type: 'sea', rating: 4.7, startPrice: 1700,
    duration: '6 hours', departureTime: '09:00 AM', groupSize: 'Up to 22 guests', overview: 'Easy snorkeling day—great for beginners and families.',
    images: [IMG1, IMG4], itinerary: ['Meetup', 'Boat departure', 'Reef stop', 'Lunch', 'Return'],
    included: ['Guide', 'Lunch', 'Gear'], notIncluded: ['Personal expenses'],
    prices: [
      { label: 'Adult', amount: 1700, discountPercent: 12 },
      { label: 'Child 3-12', amount: 980, discountPercent: 10 },
      { label: 'Infant 0-2', amount: 200, discountPercent: 100 },
    ],
  },
  {
    id: 't13', slug: 'sahl-hasheesh-sunset-cruise', citySlug: 'sahl-hasheesh', title: 'Sahl Hasheesh Sunset Cruise', type: 'sea', rating: 4.8, startPrice: 2100,
    duration: '4 hours', departureTime: '04:30 PM', groupSize: 'Up to 20 guests', overview: 'Golden-hour cruise with drinks and photo stops.',
    images: [IMG5, IMG2], itinerary: ['Marina meetup', 'Cruise', 'Photo stop', 'Return'],
    included: ['Guide', 'Soft drinks'], notIncluded: ['Dinner', 'Tips'],
    prices: [
      { label: 'Adult', amount: 2100, discountPercent: 10 },
      { label: 'Child 3-12', amount: 1200, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 250, discountPercent: 100 },
    ],
  },
  {
    id: 't14', slug: 'soma-bay-golf-and-spa', citySlug: 'soma-bay', title: 'Soma Bay Golf & Spa Day', type: 'wellness', rating: 4.6, startPrice: 3200,
    duration: '7 hours', departureTime: '10:00 AM', groupSize: 'Up to 14 guests', overview: 'Relaxed day combining golf time and spa access.',
    images: [IMG4, IMG5], itinerary: ['Pickup', 'Golf session', 'Spa access', 'Return'],
    included: ['Transport', 'Spa access'], notIncluded: ['Meals', 'Private lessons'],
    prices: [
      { label: 'Adult', amount: 3200, discountPercent: 8 },
      { label: 'Child 3-12', amount: 1800, discountPercent: 5 },
      { label: 'Infant 0-2', amount: 300, discountPercent: 100 },
    ],
  },
  {
    id: 't15',
    slug: 'safaga-kitesurf-intro',
    citySlug: 'safaga',
    title: 'Safaga Kitesurf Intro',
    type: 'adventure',
    rating: 4.7,
    startPrice: 1350,
    duration: '5 hours',
    departureTime: '10:00 AM',
    groupSize: 'Up to 12 guests',
    overview: 'Beginner-friendly coaching with shallow lagoon practice.',
    images: [IMG3, IMG1],
    itinerary: ['Meet at lagoon', 'Gear fitting', 'Safety briefing', 'Water practice', 'Debrief'],
    included: ['Instructor', 'Harness', 'Board rental'],
    notIncluded: ['Wetsuit rental', 'Photos'],
    prices: [
      { label: 'Adult', amount: 1350, discountPercent: 10 },
      { label: 'Child 3-12', amount: 780, discountPercent: 8 },
      { label: 'Infant 0-2', amount: 150, discountPercent: 100 },
    ],
  },
  {
    id: 't16',
    slug: 'ras-ghareb-coastal-scenic',
    citySlug: 'ras-ghareb',
    title: 'Ras Ghareb Coastal Scenic',
    type: 'city',
    rating: 4.4,
    startPrice: 650,
    duration: '3 hours',
    departureTime: '05:00 PM',
    groupSize: 'Up to 14 guests',
    overview: 'Golden-hour drive with lighthouse viewpoint and sea breeze stops.',
    images: [IMG4, IMG5],
    itinerary: ['Pickup', 'Coastal drive', 'Viewpoint stop', 'Tea break', 'Return'],
    included: ['Driver-guide', 'Tea'],
    notIncluded: ['Snacks'],
    prices: [
      { label: 'Adult', amount: 650, discountPercent: 8 },
      { label: 'Child 3-12', amount: 380, discountPercent: 5 },
      { label: 'Infant 0-2', amount: 80, discountPercent: 100 },
    ],
  },
  {
    id: 't17',
    slug: 'sharm-ras-mohammed-snorkel',
    citySlug: 'sharm-el-sheikh',
    title: 'Ras Mohammed Snorkel Classic',
    type: 'sea',
    rating: 4.9,
    startPrice: 2450,
    duration: '8 hours',
    departureTime: '07:00 AM',
    groupSize: 'Up to 16 guests',
    overview: 'National park snorkeling route with reef highlights.',
    images: [IMG1, IMG5],
    itinerary: ['Pickup', 'Park entry', 'Two reef stops', 'Lunch', 'Return'],
    included: ['Park fees', 'Lunch', 'Guide'],
    notIncluded: ['Photos', 'Tips'],
    prices: [
      { label: 'Adult', amount: 2450, discountPercent: 11 },
      { label: 'Child 3-12', amount: 1420, discountPercent: 9 },
      { label: 'Infant 0-2', amount: 320, discountPercent: 100 },
    ],
  },
];

export const OFFERS: {
  title: string;
  description: string;
  images: string[];
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  highlights?: string[];
  features?: string[];
  included?: string[];
  notIncluded?: string[];
  terms?: string;
  validUntil?: string;
}[] = [
  {
    title: 'Spring Marina Apartment Offer',
    description: 'Limited-time pricing on a marina-front residence package.',
    images: [IMG2],
    oldPrice: 5200000,
    newPrice: 4680000,
    discountPercent: 10,
    highlights: ['Marina front', 'Limited units', 'Flexible payment plan'],
    features: ['Sea-view residences', 'Concierge handover', 'Buyer incentives'],
    included: ['Site visit coordination', 'Payment plan overview', 'Legal pack review'],
    notIncluded: ['Government fees', 'Furnishing package'],
    terms: 'Prices and availability subject to change until reservation is confirmed.',
    validUntil: '2026-12-31',
  },
  {
    title: 'Family Desert Escape',
    description: 'Desert safari bundle for families — transport and guide included.',
    images: [IMG3],
    oldPrice: 1800,
    newPrice: 1500,
    discountPercent: 17,
    highlights: ['Family friendly', 'Private 4x4', 'Sunset stop'],
    features: ['BBQ dinner', 'Camel ride', 'Hotel pickup'],
    included: ['Transport', 'Guide', 'Soft drinks'],
    notIncluded: ['Personal expenses', 'Tips'],
  },
  {
    title: 'Downtown Studio Starter Deal',
    description: 'Starter studio inventory with buyer-friendly payment terms.',
    images: [IMG4],
    oldPrice: 3800000,
    newPrice: 3450000,
    discountPercent: 9,
  },
  {
    title: 'Royal Cruise Weekend Promo',
    description: 'Weekend Red Sea cruise with upgraded deck seating.',
    images: [IMG2],
    oldPrice: 2950,
    newPrice: 2600,
    discountPercent: 12,
  },
  {
    title: 'Lagoon Loft Launch Offer',
    description: 'Launch pricing on lagoon-view loft residences.',
    images: [IMG5],
    oldPrice: 6600000,
    newPrice: 6200000,
    discountPercent: 6,
  },
  {
    title: 'Morning Yoga + Breakfast',
    description: 'Wellness morning with beach yoga and breakfast.',
    images: [IMG4],
    oldPrice: 1100,
    newPrice: 950,
    discountPercent: 14,
  },
  {
    title: 'Dahab Blue Hole Special',
    description: 'Day trip special to Blue Hole with snorkel gear.',
    images: [IMG3],
    oldPrice: 3200,
    newPrice: 2800,
    discountPercent: 13,
  },
  {
    title: 'Soma Bay Resort Residences Launch',
    description: 'Early buyer incentives on resort-line residences.',
    images: [IMG4],
    oldPrice: 7400000,
    newPrice: 6900000,
    discountPercent: 7,
  },
  {
    title: 'Eco Shores Early Buyer Bonus',
    description: 'Eco-focused development with launch-week bonus.',
    images: [IMG3],
    oldPrice: 4400000,
    newPrice: 4100000,
    discountPercent: 7,
  },
  {
    title: 'Dolphin Quest Summer Deal',
    description: 'Marine safari with dolphin watching — summer slot deal.',
    images: [IMG4],
    oldPrice: 2700,
    newPrice: 2400,
    discountPercent: 11,
  },
  {
    title: 'Safaga Reef Snorkel Promo',
    description: 'Reef snorkel route with lunch and guide.',
    images: [IMG1],
    oldPrice: 1950,
    newPrice: 1700,
    discountPercent: 13,
  },
  {
    title: 'Sunset Cruise Limited Seats',
    description: 'Sunset cruise with limited seats — book early.',
    images: [IMG5],
    oldPrice: 2350,
    newPrice: 2100,
    discountPercent: 11,
  },
  {
    title: 'Golf & Spa Day Bundle',
    description: 'Combined golf round and spa access for one day.',
    images: [IMG5],
    oldPrice: 3500,
    newPrice: 3200,
    discountPercent: 9,
  },
  {
    title: 'Safaga Marina Point Ready Units',
    description: 'Ready-to-move marina units with launch incentives.',
    images: [IMG3],
    oldPrice: 3650000,
    newPrice: 3350000,
    discountPercent: 8,
  },
  {
    title: 'Kitesurf Intro Lagoon Pack',
    description: 'Intro kitesurf session in sheltered lagoon waters.',
    images: [IMG3],
    oldPrice: 1550,
    newPrice: 1350,
    discountPercent: 13,
  },
  {
    title: 'Ras Ghareb Sunset Scenic',
    description: 'Coastal scenic route with sunset stop.',
    images: [IMG4],
    oldPrice: 750,
    newPrice: 650,
    discountPercent: 13,
  },
  {
    title: 'Ras Mohammed Snorkel Promo',
    description: 'National park snorkel day with reef highlights.',
    images: [IMG1],
    oldPrice: 2750,
    newPrice: 2450,
    discountPercent: 11,
  },
];

/** Transfer / car rental fleet (aligned with legacy public Transfer page). */
export const CARS = [
  { slug: 'toyota-corolla', name: 'Toyota Corolla', type: 'Sedan', passengers: 4, luggage: 2, pricePerDay: 1900, image: IMG1 },
  { slug: 'hyundai-elantra', name: 'Hyundai Elantra', type: 'Sedan', passengers: 4, luggage: 2, pricePerDay: 2100, image: IMG2 },
  { slug: 'kia-sportage', name: 'Kia Sportage', type: 'SUV', passengers: 5, luggage: 3, pricePerDay: 2750, image: IMG3 },
  { slug: 'nissan-x-trail', name: 'Nissan X-Trail', type: 'SUV', passengers: 5, luggage: 4, pricePerDay: 3100, image: IMG4 },
  { slug: 'mercedes-e-class', name: 'Mercedes E-Class', type: 'Luxury', passengers: 4, luggage: 3, pricePerDay: 5200, image: IMG5 },
  { slug: 'toyota-hiace', name: 'Toyota Hiace', type: 'Van', passengers: 11, luggage: 8, pricePerDay: 4600, image: IMG1 },
  { slug: 'ford-transit', name: 'Ford Transit', type: 'Van', passengers: 14, luggage: 10, pricePerDay: 5400, image: IMG2 },
  { slug: 'bmw-5-series', name: 'BMW 5 Series', type: 'Luxury', passengers: 4, luggage: 3, pricePerDay: 5600, image: IMG3 },
  { slug: 'toyota-fortuner', name: 'Toyota Fortuner', type: 'SUV', passengers: 7, luggage: 5, pricePerDay: 3800, image: IMG4 },
  { slug: 'mini-bus-20', name: 'Mini Bus 20 seats', type: 'Mini Bus', passengers: 20, luggage: 14, pricePerDay: 7200, image: IMG5 },
  { slug: 'honda-civic', name: 'Honda Civic', type: 'Sedan', passengers: 5, luggage: 2, pricePerDay: 2200, image: IMG1 },
  { slug: 'mazda-cx5', name: 'Mazda CX-5', type: 'SUV', passengers: 5, luggage: 3, pricePerDay: 2950, image: IMG2 },
  { slug: 'mitsubishi-xpander', name: 'Mitsubishi Xpander', type: 'Van', passengers: 7, luggage: 4, pricePerDay: 3200, image: IMG3 },
  { slug: 'vw-passat', name: 'Volkswagen Passat', type: 'Sedan', passengers: 5, luggage: 3, pricePerDay: 3400, image: IMG4 },
  { slug: 'chevrolet-tahoe', name: 'Chevrolet Tahoe', type: 'SUV', passengers: 7, luggage: 6, pricePerDay: 6200, image: IMG5 },
  { slug: 'mercedes-v-class', name: 'Mercedes-Benz V-Class', type: 'Van', passengers: 8, luggage: 6, pricePerDay: 6800, image: IMG1 },
  { slug: 'cadillac-escalade', name: 'Cadillac Escalade', type: 'Luxury', passengers: 7, luggage: 5, pricePerDay: 8900, image: IMG2 },
  { slug: 'toyota-camry', name: 'Toyota Camry', type: 'Sedan', passengers: 5, luggage: 3, pricePerDay: 2400, image: IMG3 },
  { slug: 'hyundai-tucson', name: 'Hyundai Tucson', type: 'SUV', passengers: 5, luggage: 3, pricePerDay: 2650, image: IMG4 },
  { slug: 'coaster-22', name: 'Toyota Coaster 22 seats', type: 'Mini Bus', passengers: 22, luggage: 15, pricePerDay: 8400, image: IMG5 },
];

export const TESTIMONIALS = [
  { id: 'tm1', name: 'Nadine F.', citySlug: 'hurghada', text: 'Booking flow super smooth and support team very responsive.', rating: 5, role: 'Investor' },
  { id: 'tm2', name: 'Karim A.', citySlug: 'sahl-hasheesh', text: 'Tour details were clear and prices matched exactly.', rating: 5, role: 'Traveler' },
  { id: 'tm3', name: 'Mariam Z.', citySlug: 'el-gouna', text: 'City recommendations felt tailor-made for our family style.', rating: 5, role: 'Tourist' },
  { id: 'tm4', name: 'Omar R.', citySlug: 'hurghada', text: 'Property shortlist was premium and negotiation support was excellent.', rating: 5, role: 'Buyer' },
  { id: 'tm5', name: 'Hassan M.', citySlug: 'sharm-el-sheikh', text: 'Loved the clean UI and the quick WhatsApp response time.', rating: 5, role: 'Traveler' },
  { id: 'tm6', name: 'Salma H.', citySlug: 'makadi-bay', text: 'Our family day package was well planned and stress-free.', rating: 5, role: 'Tourist' },
  { id: 'tm7', name: 'Youssef K.', citySlug: 'dahab', text: 'The Dahab recommendations were spot on for a chill trip.', rating: 5, role: 'Remote worker' },
  { id: 'tm8', name: 'Dina S.', citySlug: 'el-gouna', text: 'Properties looked premium and the details felt realistic.', rating: 5, role: 'Buyer' },
  { id: 'tm9', name: 'Ahmed E.', citySlug: 'sahl-hasheesh', text: 'Safari itinerary matched the timing perfectly.', rating: 5, role: 'Traveler' },
  { id: 'tm10', name: 'Reem N.', citySlug: 'soma-bay', text: 'The UI is clean and the booking details were crystal clear.', rating: 5, role: 'Traveler' },
  { id: 'tm11', name: 'Mohamed S.', citySlug: 'marsa-alam', text: 'Great recommendations for nature-focused stays and trips.', rating: 5, role: 'Tourist' },
  { id: 'tm12', name: 'Aya K.', citySlug: 'safaga', text: 'Fast confirmation and everything matched the offer page.', rating: 5, role: 'Traveler' },
  { id: 'tm13', name: 'Fadi R.', citySlug: 'hurghada', text: 'Shortlist quality was excellent—saved us a lot of time.', rating: 5, role: 'Buyer' },
  {
    id: 'tm14',
    name: 'Layla W.',
    citySlug: 'safaga',
    text: 'Quiet destination—trip timing and pickup were exactly as promised.',
    rating: 5,
    role: 'Traveler',
  },
  {
    id: 'tm15',
    name: 'Tareq B.',
    citySlug: 'ras-ghareb',
    text: 'Simple scenic tour with honest pricing and a calm vibe.',
    rating: 5,
    role: 'Remote worker',
  },
  {
    id: 'tm16',
    name: 'Ingy L.',
    citySlug: 'sharm-el-sheikh',
    text: 'Snorkel day felt organized; crew knew the reef spots well.',
    rating: 5,
    role: 'Traveler',
  },
  {
    id: 'tm17',
    name: 'Hala J.',
    citySlug: 'safaga',
    text: 'Marina apartment listing matched photos—support answered fast.',
    rating: 5,
    role: 'Buyer',
  },
];
