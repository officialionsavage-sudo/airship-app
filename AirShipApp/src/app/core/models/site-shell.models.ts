/** CMS-driven chrome + marketing copy (`SiteContent` key `site_shell`). */

export type NavLinkDef = { label: string; path: string };

export type SiteShellContent = {
  layout: {
    navbar: {
      brandLogoSrc: string;
      brandAlt: string;
      links: NavLinkDef[];
      menuOpenLabel: string;
      menuCloseLabel: string;
    };
    footer: {
      logoSrc: string;
      logoAlt: string;
      tagline: string;
    };
    breadcrumb: {
      homeLabel: string;
    };
  };
  pages: {
    offers: {
      pill: string;
      title: string;
      subtitle: string;
      discountAriaLabel: string;
      saveTag: string;
      viewDealCta: string;
      emptyErrorTitle: string;
      emptyNoOffersTitle: string;
      emptyNoOffersSubtitle: string;
    };
    transfer: {
      heroKicker: string;
      heroTitle: string;
      heroSub: string;
      heroChipTitle: string;
      heroChipSub: string;
      tabsAriaLabel: string;
      tabAirport: string;
      tabCar: string;
      airportPanelTitle: string;
      airportPanelSub: string;
      carPanelTitle: string;
      carPanelSub: string;
      carsLoading: string;
      carsError: string;
      carsEmpty: string;
      contactAsideTitle: string;
      businessHoursTitle: string;
      asideNote: string;
      selectCarModalTitle: string;
      selectCarModalPageLabel: string;
      closeAriaLabel: string;
      carTypeLabel: string;
      selectCarPlaceholder: string;
      paginationPrev: string;
      paginationNext: string;
      successAirport: string;
      successCar: string;
      errorValidation: string;
    };
    contact: {
      title: string;
      subtitle: string;
      formTitle: string;
      asideTitle: string;
      locationSectionTitle: string;
      locationSubtitle: string;
      locationOpenButton: string;
      waButton: string;
      validationError: string;
      sending: string;
      sendButton: string;
    };
    realEstateList: {
      /** Use {{city}} placeholder */
      titleTemplate: string;
      subtitle: string;
      locationFilterLabel: string;
      locationAll: string;
      facilitiesTemplate: string;
      deliveryPrefix: string;
      viewDetailsCta: string;
      emptyErrorTitle: string;
      emptyNoneTitle: string;
      emptyNoneSubtitle: string;
    };
    toursList: {
      titleTemplate: string;
      subtitle: string;
      tourTypeFilterLabel: string;
      emptyErrorTitle: string;
      retryButton: string;
      emptyNoneTitle: string;
      emptyNoneSubtitle: string;
      viewDetailsCta: string;
    };
    cityPortal: {
      realEstateIcon: string;
      realEstateTitle: string;
      realEstateSubtitle: string;
      realEstateCta: string;
      toursIcon: string;
      toursTitle: string;
      toursSubtitle: string;
      toursCta: string;
    };
    unitDetail: {
      bedsSuffix: string;
      bathsSuffix: string;
      sqmSuffix: string;
      unitFeaturesHeading: string;
      facilitiesHeading: string;
      pricingHeading: string;
      perDayLabel: string;
      perWeekLabel: string;
      perMonthLabel: string;
      bookingTitle: string;
      bookingValidationError: string;
      bookingSending: string;
      bookNowButton: string;
      whatsAppButton: string;
    };
    projectDetail: {
      locationHeading: string;
      locationHint: string;
      openLocationButton: string;
      facilitiesHeading: string;
      featuresHeading: string;
      unitsSectionTitle: string;
      unitMetaTemplate: string;
      unitPricePrefix: string;
      unitPriceSuffix: string;
      viewUnitCta: string;
    };
    tourDetail: {
      specialDealBadge: string;
      ratingSuffix: string;
      featuresHeading: string;
      tagFlexible: string;
      tagPremium: string;
      itineraryHeading: string;
      includedHeading: string;
      notIncludedHeading: string;
      pricingHeading: string;
      adultLabel: string;
      childLabel: string;
      infantLabel: string;
      bookingTitle: string;
      totalPrefix: string;
      bookingValidationError: string;
      bookingSending: string;
      bookNowButton: string;
      whatsAppButton: string;
    };
  };
};
