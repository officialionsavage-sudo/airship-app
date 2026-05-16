import type { CmsLocale, HomePageContent, HomePayloadV2 } from './home-page.models';
import { CMS_LOCALES } from './home-page.models';

/** Mirrors `AirShipBackend/prisma/home-page-content.json` — update both when changing defaults. */
export const HOME_PAGE_DEFAULTS: HomePageContent = {
  hero: {
    kicker: 'AirShip · Egypt',
    titlePrefix: 'Plan stay. Book tour.',
    typingPhrases: [
      'Find dream home.',
      'Book a stay.',
      'Plan your tour.',
      'Get instant support.',
    ],
    typingAriaLabel: 'Find your next experience',
    subtitle:
      'Clean listings, curated experiences, and direct support—built for fast decisions.',
    heroLogo: {
      src: 'assets/images/vertical-logo.png',
      alt: 'AirShip',
    },
    primaryCta: {
      label: 'Explore cities',
      href: '#cities',
    },
    secondaryCta: {
      label: 'View offers',
      routerLink: '/offers',
      chip: 'Hot',
    },
    scrollIndicatorLabel: 'Explore',
    scrollIndicatorAriaLabel: 'Explore cities',
  },
  citiesSection: {
    title: 'Explore Our Cities',
    description:
      "Choose from Egypt's top coastal destinations for lifestyle, investment, and adventure.",
  },
  about: {
    kicker: 'About AirShip',
    title: 'Built for fast decisions—travel, tours, and coastal homes.',
    lead:
      'AirShip is your Red Sea co-pilot. We curate destinations, tours, and real estate opportunities with clean listings, clear pricing, and direct support—so you can decide quickly and confidently.',
    points: [
      {
        title: 'Curated, not cluttered',
        body: 'We hand-pick what matters: highlights, inclusions, and the real reasons to choose a place.',
      },
      {
        title: 'Local insight, global polish',
        body: 'Destination guidance that feels premium—without the sales pressure.',
      },
      {
        title: 'Direct support',
        body: 'Questions? You get fast answers—no long forms, no waiting days.',
      },
    ],
    stats: [
      { value: '10+', label: 'Coastal cities' },
      { value: '30+', label: 'Curated experiences' },
      { value: '24/7', label: 'WhatsApp support' },
    ],
    visualCards: [
      {
        badge: 'Real estate',
        title: 'Projects & units',
        subtitle: 'Starting prices · highlights · amenities',
      },
      {
        badge: 'Tours',
        title: 'Itineraries',
        subtitle: "What's included · timing · group sizes",
      },
      {
        badge: 'Cities',
        title: 'Lifestyle picks',
        subtitle: 'Curated neighborhoods · vibes · highlights',
      },
    ],
  },
  testimonialsSection: {
    title: 'What Our Customers Say',
    description: 'Real feedback from travelers and buyers. Quick, clear, and consistent.',
  },
};

export function mergeHomePageContent(api: Partial<HomePageContent> | null | undefined): HomePageContent {
  const d = HOME_PAGE_DEFAULTS;
  if (!api) {
    return structuredClone(d);
  }

  const hero: HomePageContent['hero'] = {
    ...d.hero,
    ...api.hero,
    heroLogo: { ...d.hero.heroLogo, ...api.hero?.heroLogo },
    primaryCta: { ...d.hero.primaryCta, ...api.hero?.primaryCta },
    secondaryCta: { ...d.hero.secondaryCta, ...api.hero?.secondaryCta },
    typingPhrases: api.hero?.typingPhrases ?? d.hero.typingPhrases,
  };

  const about: HomePageContent['about'] = {
    ...d.about,
    ...api.about,
    points: api.about?.points ?? d.about.points,
    stats: api.about?.stats ?? d.about.stats,
    visualCards: api.about?.visualCards ?? d.about.visualCards,
  };

  return {
    hero,
    citiesSection: { ...d.citiesSection, ...api.citiesSection },
    about,
    testimonialsSection: { ...d.testimonialsSection, ...api.testimonialsSection },
  };
}

function isHomePayloadV2(raw: unknown): raw is HomePayloadV2 {
  return (
    !!raw &&
    typeof raw === 'object' &&
    (raw as HomePayloadV2).version === 2 &&
    typeof (raw as HomePayloadV2).locales === 'object' &&
    (raw as HomePayloadV2).locales !== null
  );
}

/** Admin: normalize API payload into one full `HomePageContent` per CMS locale. */
export function migrateRawHomeToBundled(raw: unknown): Record<CmsLocale, HomePageContent> {
  if (isHomePayloadV2(raw)) {
    const out = {} as Record<CmsLocale, HomePageContent>;
    for (const loc of CMS_LOCALES) {
      out[loc] = mergeHomePageContent(raw.locales?.[loc]);
    }
    return out;
  }
  const base = mergeHomePageContent(raw as Partial<HomePageContent>);
  const out = {} as Record<CmsLocale, HomePageContent>;
  for (const loc of CMS_LOCALES) {
    out[loc] = structuredClone(base);
  }
  return out;
}

export function bundledHomeToStorageV2(bundled: Record<CmsLocale, HomePageContent>): HomePayloadV2 {
  const locales: Partial<Record<CmsLocale, HomePageContent>> = {};
  for (const loc of CMS_LOCALES) {
    locales[loc] = bundled[loc];
  }
  return { version: 2, locales };
}
