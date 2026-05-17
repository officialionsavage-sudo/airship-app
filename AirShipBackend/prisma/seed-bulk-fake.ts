/**
 * Adds demo volume to an existing DB (does not wipe catalog).
 * Run after `npm run db:seed` on production/staging.
 *
 *   DATABASE_URL="postgresql://..." tsx prisma/seed-bulk-fake.ts
 */
import { PrismaClient, type ProjectStatus, type PropertyType, type ReviewStatus, type TourType } from '@prisma/client';
import { loadSeedImg } from './seed-images.loader.ts';

const prisma = new PrismaClient();

const IMG = [loadSeedImg(1), loadSeedImg(2), loadSeedImg(3), loadSeedImg(4), loadSeedImg(5)] as const;

const FIRST = [
  'Ahmed', 'Sara', 'Omar', 'Mariam', 'Karim', 'Nour', 'Youssef', 'Dina', 'Hassan', 'Layla',
  'Tarek', 'Hala', 'Fadi', 'Reem', 'Mohamed', 'Aya', 'Nadine', 'Ingy', 'Salma', 'Yasmin',
];
const LAST = [
  'Hassan', 'Ali', 'Farouk', 'Nabil', 'Salem', 'Adel', 'Rashad', 'Kamal', 'Zaki', 'Fouad',
  'Mansour', 'Saeed', 'Hamza', 'Ibrahim', 'Mahmoud', 'Osman', 'Qasim', 'Rizk', 'Saber', 'Taha',
];
const BOOKING_TYPES = ['unit', 'tour', 'transfer'] as const;
const SUBJECTS = [
  'Investment inquiry', 'Tour availability', 'Transfer quote', 'Partnership', 'Group booking',
  'Villa viewing', 'Payment plan', 'Corporate retreat', 'Wedding package', 'General question',
];
const REVIEW_SNIPPETS = [
  'Smooth booking and clear communication throughout.',
  'Pricing matched the website — no surprises at checkout.',
  'Team replied on WhatsApp within minutes.',
  'Great shortlist of properties for our budget.',
  'Tour guide was professional and punctual.',
  'Would recommend for Red Sea family trips.',
  'Admin follow-up after inquiry was helpful.',
  'Clean listing details and realistic photos.',
  'Pickup was on time for the marina tour.',
  'Easy to compare units side by side.',
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!;
}

function randSlug(prefix: string, citySlug: string, i: number): string {
  return `${prefix}-${citySlug}-${i}`.replace(/[^a-z0-9-]/g, '-');
}

function fakePhone(i: number): string {
  return `+20 10${String(10000000 + (i % 89999999)).slice(0, 8)}`;
}

function fakeEmail(first: string, last: string, i: number): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.demo`;
}

async function seedExtraCatalog(): Promise<void> {
  const cities = await prisma.city.findMany({
    where: { isComingSoon: false },
    orderBy: { sortOrder: 'asc' },
  });
  if (!cities.length) {
    console.log('No cities — run db:seed first.');
    return;
  }

  const statuses: ProjectStatus[] = ['ready', 'under_construction', 'launching'];
  const propertyTypes: PropertyType[] = ['apartment', 'villa', 'townhouse', 'chalet', 'studio'];
  const tourTypes: TourType[] = ['sea', 'desert', 'island', 'city', 'adventure', 'wellness'];
  let projectN = 0;
  let tourN = 0;

  for (const city of cities) {
    const filters = await prisma.catalogFilter.findMany({ where: { cityId: city.id } });
    const reFilter = filters.find((f) => f.domain === 'REAL_ESTATE');
    const tourFilters = filters.filter((f) => f.domain === 'TOURS');

    for (let i = 1; i <= 4; i++) {
      const slug = randSlug('demo-project', city.slug, projectN++);
      const exists = await prisma.project.findUnique({ where: { slug } });
      if (exists) continue;

      const locationSlug = reFilter?.slug ?? 'downtown';
      const img = pick(IMG, projectN);
      const project = await prisma.project.create({
        data: {
          slug,
          title: `${city.title} Demo Residences ${i}`,
          startingPrice: 2_500_000 + projectN * 125_000,
          locationName: reFilter?.title ?? 'Downtown',
          locationSlug,
          status: pick(statuses, projectN),
          propertyType: pick(propertyTypes, projectN),
          description: `Demo listing ${i} in ${city.title} for staging and QA.`,
          shortDescription: `Demo ${i} — ${city.title}`,
          images: [img, pick(IMG, projectN + 1)],
          heroImageBase64: img,
          features: ['Sea view', 'Smart home', 'Concierge'],
          amenities: ['Pool', 'Gym', 'Parking'],
          developerName: 'Demo Developments',
          mapEmbedUrl: 'https://maps.google.com/?q=Egypt&output=embed',
          videoUrl: '',
          cityId: city.id,
          units: {
            create: [
              {
                slug: `${slug}-unit-a`,
                title: `${city.title} Demo Suite A`,
                images: [pick(IMG, projectN + 2)],
                size: 90 + (projectN % 40),
                beds: 2,
                baths: 2,
                description: 'Demo unit for bookings and admin tests.',
                features: ['Balcony', 'Wi‑Fi'],
                pricePerDay: 5000 + (projectN % 10) * 200,
                pricePerWeek: 28000,
                pricePerMonth: 105000,
                discountDay: 8,
                discountWeek: 12,
                discountMonth: 18,
              },
              {
                slug: `${slug}-unit-b`,
                title: `${city.title} Demo Suite B`,
                images: [pick(IMG, projectN + 3)],
                size: 55 + (projectN % 25),
                beds: 1,
                baths: 1,
                description: 'Second demo unit in the same project.',
                features: ['Kitchenette', 'Marina walk'],
                pricePerDay: 3500,
                pricePerWeek: 20000,
                pricePerMonth: 78000,
                discountDay: 10,
                discountWeek: 14,
                discountMonth: 20,
              },
            ],
          },
        },
      });

      if (reFilter) {
        await prisma.projectCatalogFilter.create({
          data: { projectId: project.id, catalogFilterId: reFilter.id },
        });
      }
    }

    for (let i = 1; i <= 5; i++) {
      const slug = randSlug('demo-tour', city.slug, tourN++);
      const exists = await prisma.tour.findUnique({ where: { slug } });
      if (exists) continue;

      const type = pick(tourTypes, tourN);
      const tour = await prisma.tour.create({
        data: {
          slug,
          title: `${city.title} Demo ${type} Experience ${i}`,
          type,
          rating: 4.2 + (tourN % 8) * 0.1,
          startPrice: 1800 + (tourN % 15) * 100,
          duration: `${4 + (tourN % 4)} hours`,
          departureTime: '09:00 AM',
          groupSize: 'Up to 16 guests',
          overview: `Demo ${type} tour in ${city.title} for production smoke tests.`,
          images: [pick(IMG, tourN), pick(IMG, tourN + 1)],
          itinerary: ['Pickup', 'Main activity', 'Lunch', 'Return'],
          included: ['Guide', 'Transport'],
          notIncluded: ['Tips', 'Photos'],
          cityId: city.id,
          prices: {
            create: [
              { label: 'Adult', amount: 1800 + tourN * 50, discountPercent: 5 },
              { label: 'Child', amount: 1100, discountPercent: 10 },
            ],
          },
        },
      });

      const cf = tourFilters.find((f) => f.slug === 'water-sports') ?? tourFilters[0];
      if (cf) {
        await prisma.tourCatalogFilter.create({
          data: { tourId: tour.id, catalogFilterId: cf.id },
        });
      }
    }
  }

  console.log(`Extra catalog: up to ${projectN} demo projects & ${tourN} demo tours attempted per city rules.`);
}

async function seedInbound(): Promise<void> {
  const cities = await prisma.city.findMany({ select: { slug: true } });
  const projects = await prisma.project.findMany({ select: { slug: true, city: { select: { slug: true } } } });
  const tours = await prisma.tour.findMany({ select: { slug: true, city: { select: { slug: true } } } });
  const units = await prisma.unit.findMany({
    select: { slug: true, project: { select: { slug: true, city: { select: { slug: true } } } } },
  });

  if (!cities.length) {
    console.log('No cities — run db:seed first.');
    return;
  }

  const bookingCount = Number(process.env.SEED_BULK_BOOKINGS ?? 120);
  const contactCount = Number(process.env.SEED_BULK_CONTACTS ?? 70);
  const reviewCount = Number(process.env.SEED_BULK_REVIEWS ?? 90);

  console.log(`Seeding ${bookingCount} bookings, ${contactCount} contacts, ${reviewCount} reviews…`);

  const bookingRows: Parameters<typeof prisma.bookingInquiry.createMany>[0]['data'] = [];
  for (let i = 0; i < bookingCount; i++) {
    const first = pick(FIRST, i);
    const last = pick(LAST, i + 3);
    const kind = pick(BOOKING_TYPES, i);
    const citySlug = pick(cities, i).slug;
    let relatedSlug = citySlug;
    if (kind === 'unit' && units.length) {
      const u = pick(units, i);
      relatedSlug = u.slug;
    } else if (kind === 'tour' && tours.length) {
      relatedSlug = pick(tours, i).slug;
    } else if (projects.length) {
      relatedSlug = pick(projects, i).slug;
    }
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + (i % 30) + 1);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + (i % 7) + 2);
    bookingRows.push({
      fullName: `${first} ${last}`,
      phone: fakePhone(i),
      email: i % 4 === 0 ? fakeEmail(first, last, i) : null,
      citySlug,
      relatedSlug,
      bookingType: kind,
      checkIn,
      checkOut,
      guests: 1 + (i % 6),
      notes: i % 5 === 0 ? `Demo booking note #${i + 1}` : null,
      createdAt: new Date(Date.now() - i * 3600_000 * 4),
    });
  }
  await prisma.bookingInquiry.createMany({ data: bookingRows });

  const contactRows: Parameters<typeof prisma.contactInquiry.createMany>[0]['data'] = [];
  for (let i = 0; i < contactCount; i++) {
    const first = pick(FIRST, i + 7);
    const last = pick(LAST, i + 11);
    contactRows.push({
      fullName: `${first} ${last}`,
      phone: fakePhone(i + 500),
      email: i % 3 === 0 ? fakeEmail(first, last, i + 100) : null,
      subject: pick(SUBJECTS, i),
      message: `Demo contact message ${i + 1}: interested in ${pick(cities, i).slug} options.`,
      createdAt: new Date(Date.now() - i * 3600_000 * 6),
    });
  }
  await prisma.contactInquiry.createMany({ data: contactRows });

  const statuses: ReviewStatus[] = ['approved', 'approved', 'approved', 'pending', 'rejected'];
  const targets: Array<{ targetType: 'app' | 'service' | 'tour' | 'project'; targetSlug?: string }> = [
    { targetType: 'app' },
    { targetType: 'service' },
  ];
  if (tours.length) targets.push({ targetType: 'tour', targetSlug: pick(tours, 0).slug });
  if (projects.length) targets.push({ targetType: 'project', targetSlug: pick(projects, 0).slug });

  const reviewRows: Parameters<typeof prisma.review.createMany>[0]['data'] = [];
  for (let i = 0; i < reviewCount; i++) {
    const first = pick(FIRST, i + 2);
    const last = pick(LAST, i + 5);
    const t = pick(targets, i);
    reviewRows.push({
      targetType: t.targetType,
      targetSlug: t.targetSlug ?? null,
      name: `${first} ${last.charAt(0)}.`,
      email: i % 6 === 0 ? fakeEmail(first, last, i + 200) : null,
      text: `${pick(REVIEW_SNIPPETS, i)} (demo #${i + 1})`,
      rating: 3 + (i % 3),
      role: i % 2 === 0 ? pick(['Traveler', 'Buyer', 'Investor'], i) : null,
      citySlug: pick(cities, i).slug,
      status: pick(statuses, i),
      createdAt: new Date(Date.now() - i * 3600_000 * 8),
    });
  }
  await prisma.review.createMany({ data: reviewRows });
}

async function main(): Promise<void> {
  console.log('Bulk fake seed (additive)…');
  await seedExtraCatalog();
  await seedInbound();
  const [cities, projects, tours, units, offers, cars, bookings, contacts, reviews] =
    await Promise.all([
      prisma.city.count(),
      prisma.project.count(),
      prisma.tour.count(),
      prisma.unit.count(),
      prisma.offer.count(),
      prisma.car.count(),
      prisma.bookingInquiry.count(),
      prisma.contactInquiry.count(),
      prisma.review.count(),
    ]);
  console.log('Counts:', {
    cities,
    projects,
    tours,
    units,
    offers,
    cars,
    bookings,
    contacts,
    reviews,
  });
  console.log('Bulk fake seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
