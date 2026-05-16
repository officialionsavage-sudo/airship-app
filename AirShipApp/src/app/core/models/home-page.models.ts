export interface HomeHeroLogo {
  /** Site-relative image URL (e.g. `assets/images/vertical-logo.png`). */
  src: string;
  alt?: string;
}

export interface HomeHeroPrimaryCta {
  label: string;
  href: string;
}

export interface HomeHeroSecondaryCta {
  label: string;
  routerLink: string;
  chip?: string;
}

export interface HomeHero {
  kicker: string;
  titlePrefix: string;
  typingPhrases: string[];
  typingAriaLabel?: string;
  subtitle: string;
  heroLogo: HomeHeroLogo;
  primaryCta: HomeHeroPrimaryCta;
  secondaryCta: HomeHeroSecondaryCta;
  scrollIndicatorLabel: string;
  scrollIndicatorAriaLabel?: string;
}

export interface HomeSectionHead {
  title: string;
  description: string;
}

export interface HomeAboutPoint {
  title: string;
  body: string;
}

export interface HomeAboutStat {
  value: string;
  label: string;
}

export interface HomeAboutVisualCard {
  badge: string;
  title: string;
  subtitle: string;
}

export interface HomeAbout {
  kicker: string;
  title: string;
  lead: string;
  points: HomeAboutPoint[];
  stats: HomeAboutStat[];
  visualCards: HomeAboutVisualCard[];
}

export interface HomePageContent {
  hero: HomeHero;
  citiesSection: HomeSectionHead;
  about: HomeAbout;
  testimonialsSection: HomeSectionHead;
}

/** CMS + API locale codes (home content + `Accept-Language`). */
export const CMS_LOCALES = ['en', 'ar', 'de', 'ru'] as const;
export type CmsLocale = (typeof CMS_LOCALES)[number];

/** Stored shape for `SiteContent` key `home` when multiple languages are configured. */
export interface HomePayloadV2 {
  version: 2;
  locales: Partial<Record<CmsLocale, HomePageContent>>;
}
