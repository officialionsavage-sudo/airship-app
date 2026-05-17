/**
 * Resume catalog seed without wiping existing rows (for slow/remote DBs).
 * Fills missing projects, tours, offers, cars, reviews, home content.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PrismaClient,
  type ProjectStatus,
  type PropertyType,
  type TourType,
} from '@prisma/client';
import {
  CARS,
  DEFAULT_TOUR_TYPE_FILTERS_SEED,
  OFFERS,
  PROJECTS,
  TESTIMONIALS,
  TOURS,
} from './seed-fixtures.ts';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

function mapProjectStatus(s: string): ProjectStatus {
  if (s === 'under-construction') return 'under_construction';
  if (s === 'launching') return 'launching';
  return 'ready';
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      console.warn(`${label} failed (attempt ${i + 1}/${tries}):`, e);
      await sleep(2000 * (i + 1));
    }
  }
  throw last;
}

async function seedSiteSettingDefaults(): Promise<void> {
  const defaults: Array<[string, string]> = [
    ['contact_phone', '+20 114 484 1607'],
    ['contact_whatsapp', '+20 114 484 1607'],
    ['contact_email', 'info@airship.com'],
    ['contact_location', 'Hurghada, Red Sea, Egypt'],
    ['contact_hours_line_1', 'Monday - Friday: 9:00 AM - 6:00 PM'],
    ['contact_hours_line_2', 'Saturday: 10:00 AM - 4:00 PM'],
    ['contact_hours_line_3', 'Sunday: Closed'],
  ];
  for (const [key, value] of defaults) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (!existing) await prisma.siteSetting.create({ data: { key, value } });
  }
}

async function seedMissingProjects(): Promise<void> {
  for (const p of PROJECTS) {
    const exists = await prisma.project.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    console.log(`Project: ${p.slug}`);
    const created = await withRetry(`project ${p.slug}`, () =>
      prisma.project.create({
        data: {
          slug: p.slug,
          title: p.title,
          startingPrice: p.startingPrice ?? null,
          locationName: p.locationName,
          locationSlug: p.locationSlug,
          status: mapProjectStatus(p.status),
          propertyType: p.propertyType as PropertyType,
          description: p.description,
          shortDescription: p.shortDescription,
          images: p.images,
          heroImageBase64: p.heroImage,
          features: p.features,
          amenities: p.amenities,
          developerName: p.developerName,
          mapEmbedUrl: p.mapEmbedUrl,
          videoUrl: p.videoUrl,
          city: { connect: { slug: p.citySlug } },
          units: {
            create: p.units.map((u) => ({
              slug: u.slug,
              title: u.title,
              images: u.images,
              size: u.size,
              beds: u.beds,
              baths: u.baths,
              description: u.description,
              features: u.features,
              pricePerDay: u.pricePerDay,
              pricePerWeek: u.pricePerWeek,
              pricePerMonth: u.pricePerMonth,
              discountDay: u.discounts.day,
              discountWeek: u.discounts.week,
              discountMonth: u.discounts.month,
            })),
          },
        },
      }),
    );
    const cf = await prisma.catalogFilter.findFirst({
      where: { cityId: created.cityId, domain: 'REAL_ESTATE', slug: created.locationSlug },
    });
    if (cf) {
      await prisma.projectCatalogFilter.upsert({
        where: {
          projectId_catalogFilterId: { projectId: created.id, catalogFilterId: cf.id },
        },
        create: { projectId: created.id, catalogFilterId: cf.id },
        update: {},
      });
    }
    await sleep(500);
  }
}

async function seedMissingTours(): Promise<void> {
  for (const t of TOURS) {
    const exists = await prisma.tour.findUnique({ where: { slug: t.slug } });
    if (exists) continue;
    console.log(`Tour: ${t.slug}`);
    const tour = await withRetry(`tour ${t.slug}`, () =>
      prisma.tour.create({
        data: {
          slug: t.slug,
          title: t.title,
          type: t.type as TourType,
          rating: t.rating,
          startPrice: t.startPrice,
          duration: t.duration,
          departureTime: t.departureTime,
          groupSize: t.groupSize,
          overview: t.overview,
          images: t.images,
          itinerary: t.itinerary,
          included: t.included,
          notIncluded: t.notIncluded,
          city: { connect: { slug: t.citySlug } },
          prices: {
            create: t.prices.map((pr) => ({
              label: pr.label,
              amount: pr.amount,
              discountPercent: pr.discountPercent,
            })),
          },
        },
      }),
    );
    const cityRow = await prisma.city.findUnique({ where: { slug: t.citySlug }, select: { id: true } });
    if (!cityRow) continue;
    const cfs = await prisma.catalogFilter.findMany({
      where: { cityId: cityRow.id, domain: 'TOURS' },
    });
    for (const f of DEFAULT_TOUR_TYPE_FILTERS_SEED) {
      if ((f.tourTypes as readonly string[]).includes(t.type)) {
        const cf = cfs.find((x) => x.slug === f.slug);
        if (cf) {
          await prisma.tourCatalogFilter.upsert({
            where: { tourId_catalogFilterId: { tourId: tour.id, catalogFilterId: cf.id } },
            create: { tourId: tour.id, catalogFilterId: cf.id },
            update: {},
          });
        }
      }
    }
    await sleep(500);
  }
}

async function seedOffersIfEmpty(): Promise<void> {
  if ((await prisma.offer.count()) > 0) return;
  console.log('Seeding offers…');
  for (let i = 0; i < OFFERS.length; i++) {
    const o = OFFERS[i]!;
    await withRetry(`offer ${i}`, () =>
      prisma.offer.create({
        data: {
          title: o.title,
          description: o.description,
          images: o.images,
          oldPrice: o.oldPrice,
          newPrice: o.newPrice,
          discountPercent: o.discountPercent,
          highlights: o.highlights ?? [],
          features: o.features ?? [],
          included: o.included ?? [],
          notIncluded: o.notIncluded ?? [],
          terms: o.terms ?? null,
          validUntil: o.validUntil ? new Date(o.validUntil) : null,
          sortOrder: i,
        },
      }),
    );
    await sleep(300);
  }
}

async function seedCarsIfEmpty(): Promise<void> {
  if ((await prisma.car.count()) > 0) return;
  console.log('Seeding vehicle types & cars…');
  const vehicleLabels = ['Sedan', 'SUV', 'Van', 'Luxury', 'Mini Bus'];
  for (let i = 0; i < vehicleLabels.length; i++) {
    await prisma.vehicleType.create({ data: { label: vehicleLabels[i]!, sortOrder: i } });
  }
  for (let i = 0; i < CARS.length; i++) {
    const c = CARS[i]!;
    await withRetry(`car ${c.slug}`, () =>
      prisma.car.create({
        data: {
          slug: c.slug,
          name: c.name,
          type: c.type,
          passengers: c.passengers,
          luggage: c.luggage,
          pricePerDay: c.pricePerDay,
          imageBase64: c.image,
          sortOrder: i,
        },
      }),
    );
    await sleep(200);
  }
}

async function seedReviewsIfEmpty(): Promise<void> {
  const approvedApp = await prisma.review.count({ where: { targetType: 'app', status: 'approved' } });
  if (approvedApp > 0) return;
  console.log('Seeding approved app reviews…');
  const reviewBase = new Date('2020-01-01T00:00:00.000Z');
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const tm = TESTIMONIALS[i]!;
    await prisma.review.create({
      data: {
        targetType: 'app',
        name: tm.name,
        role: tm.role,
        text: tm.text,
        rating: tm.rating,
        citySlug: tm.citySlug,
        status: 'approved',
        createdAt: new Date(reviewBase.getTime() + i * 1000),
      },
    });
  }
}

async function seedHomeContent(): Promise<void> {
  const homePayload = JSON.parse(readFileSync(join(__dirname, 'home-page-content.json'), 'utf8'));
  await prisma.siteContent.upsert({
    where: { key: 'home' },
    create: { key: 'home', payload: homePayload },
    update: { payload: homePayload },
  });
}

async function main(): Promise<void> {
  console.log('Resume seed (no wipe)…');
  await seedMissingProjects();
  await seedMissingTours();
  await seedOffersIfEmpty();
  await seedCarsIfEmpty();
  await seedReviewsIfEmpty();
  await seedSiteSettingDefaults();
  await seedHomeContent();
  console.log('Resume seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
