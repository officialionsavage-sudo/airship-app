import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent), data: { breadcrumb: 'Home' } },
  { path: 'city/:citySlug', loadComponent: () => import('./pages/city-details/city-details.component').then((m) => m.CityDetailsComponent), data: { breadcrumb: 'City' } },
  { path: 'city/:citySlug/real-estate', loadComponent: () => import('./pages/real-estate-projects/real-estate-projects.component').then((m) => m.RealEstateProjectsComponent), data: { breadcrumb: 'Real Estate' } },
  { path: 'city/:citySlug/real-estate/:projectSlug', loadComponent: () => import('./pages/resort-details/resort-details.component').then((m) => m.ResortDetailsComponent), data: { breadcrumb: 'Project' } },
  { path: 'city/:citySlug/real-estate/:projectSlug/unit/:unitSlug', loadComponent: () => import('./pages/unit-details/unit-details.component').then((m) => m.UnitDetailsComponent), data: { breadcrumb: 'Unit' } },
  { path: 'city/:citySlug/tours', loadComponent: () => import('./pages/tours/tours.component').then((m) => m.ToursComponent), data: { breadcrumb: 'Tours' } },
  { path: 'city/:citySlug/tours/:tourSlug', loadComponent: () => import('./pages/tour-details/tour-details.component').then((m) => m.TourDetailsComponent), data: { breadcrumb: 'Tour Details' } },
  { path: 'offers/:offerId', loadComponent: () => import('./pages/offer-details/offer-details.component').then((m) => m.OfferDetailsComponent), data: { breadcrumb: 'Offer' } },
  { path: 'offers', loadComponent: () => import('./pages/offers/offers.component').then((m) => m.OffersComponent), data: { breadcrumb: 'Offers' } },
  { path: 'contact-us', loadComponent: () => import('./pages/contact-us/contact-us.component').then((m) => m.ContactUsComponent), data: { breadcrumb: 'Contact Us' } },
  { path: 'transfer', loadComponent: () => import('./pages/transfer/transfer.component').then((m) => m.TransferComponent), data: { breadcrumb: 'Transfer' } },
  { path: '**', redirectTo: '' },
];
