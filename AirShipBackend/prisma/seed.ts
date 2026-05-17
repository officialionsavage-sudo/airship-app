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
  CITIES,
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

async function clearCatalog(): Promise<void> {
  await prisma.offer.deleteMany();
  await prisma.vehicleType.deleteMany();
  await prisma.car.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.project.deleteMany();
  await prisma.catalogFilter.deleteMany();
  await prisma.city.deleteMany();
  await prisma.review.deleteMany({ where: { targetType: 'app', status: 'approved' } });
}

/** Insert defaults only when missing (does not overwrite CMS edits). */
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
    if (!existing) {
      await prisma.siteSetting.create({ data: { key, value } });
    }
  }
}

async function main(): Promise<void> {
  console.log('Clearing catalog tables…');
  await clearCatalog();

  console.log('Seeding cities…');
  for (let i = 0; i < CITIES.length; i++) {
    const c = CITIES[i];
    await prisma.city.create({
      data: {
        title: c.title,
        slug: c.slug,
        shortDescription: c.shortDescription,
        imageBase64: c.image,
        heroImageBase64: c.heroImage,
        isComingSoon: c.isComingSoon,
        sortOrder: i,
      },
    });
  }

  console.log('Seeding real-estate catalog filters (per city, from project location slugs)…');
  const cityRows = await prisma.city.findMany({ select: { id: true, slug: true } });
  const slugTitle = (slug: string) =>
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  for (const c of cityRows) {
    const slugs = new Set(
      PROJECTS.filter((p) => p.citySlug === c.slug).map((p) => p.locationSlug),
    );
    let sortOrder = 0;
    for (const slug of [...slugs].sort()) {
      await prisma.catalogFilter.create({
        data: {
          cityId: c.id,
          domain: 'REAL_ESTATE',
          title: slugTitle(slug),
          slug,
          sortOrder: sortOrder++,
        },
      });
    }
  }

  console.log('Seeding tour catalog filters (all cities)…');
  for (const c of cityRows) {
    for (let i = 0; i < DEFAULT_TOUR_TYPE_FILTERS_SEED.length; i++) {
      const f = DEFAULT_TOUR_TYPE_FILTERS_SEED[i];
      await prisma.catalogFilter.create({
        data: {
          cityId: c.id,
          domain: 'TOURS',
          title: f.title,
          slug: f.slug,
          sortOrder: i,
        },
      });
    }
  }

  console.log('Seeding projects & units…');
  for (const p of PROJECTS) {
    const created = await prisma.project.create({
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
    });
    const cf = await prisma.catalogFilter.findFirst({
      where: { cityId: created.cityId, domain: 'REAL_ESTATE', slug: created.locationSlug },
    });
    if (cf) {
      await prisma.projectCatalogFilter.create({
        data: { projectId: created.id, catalogFilterId: cf.id },
      });
    }
  }

  console.log('Seeding tours…');
  for (const t of TOURS) {
    const tour = await prisma.tour.create({
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
    });
    const cityRow = await prisma.city.findUnique({ where: { slug: t.citySlug }, select: { id: true } });
    if (!cityRow) continue;
    const cfs = await prisma.catalogFilter.findMany({
      where: { cityId: cityRow.id, domain: 'TOURS' },
    });
    for (const f of DEFAULT_TOUR_TYPE_FILTERS_SEED) {
      if ((f.tourTypes as readonly string[]).includes(t.type)) {
        const cf = cfs.find((x) => x.slug === f.slug);
        if (cf) {
          await prisma.tourCatalogFilter.create({
            data: { tourId: tour.id, catalogFilterId: cf.id },
          });
        }
      }
    }
  }

  console.log('Seeding offers…');
  for (let i = 0; i < OFFERS.length; i++) {
    const o = OFFERS[i];
    await prisma.offer.create({
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
    });
  }

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

  console.log('Seeding vehicle types…');
  const vehicleLabels = ['Sedan', 'SUV', 'Van', 'Luxury', 'Mini Bus'];
  for (let i = 0; i < vehicleLabels.length; i++) {
    await prisma.vehicleType.create({
      data: { label: vehicleLabels[i]!, sortOrder: i },
    });
  }

  console.log('Seeding cars (transfer fleet)…');
  for (let i = 0; i < CARS.length; i++) {
    const c = CARS[i];
    await prisma.car.create({
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
    });
  }

  console.log('Ensuring default site settings…');
  await seedSiteSettingDefaults();

  const homePayload = JSON.parse(readFileSync(join(__dirname, 'home-page-content.json'), 'utf8'));

  console.log('Seeding site content (home)…');
  await prisma.siteContent.upsert({
    where: { key: 'home' },
    create: { key: 'home', payload: homePayload },
    update: { payload: homePayload },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
