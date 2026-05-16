import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'cms/site-content',
        loadComponent: () =>
          import('./pages/cms/site-content-list.component').then((m) => m.SiteContentListComponent),
      },
      {
        path: 'cms/site-content/:key',
        loadComponent: () =>
          import('./pages/cms/site-content-edit.component').then((m) => m.SiteContentEditComponent),
      },
      {
        path: 'cms/site-settings',
        loadComponent: () =>
          import('./pages/cms/site-settings.component').then((m) => m.SiteSettingsComponent),
      },
      {
        path: 'inbound/reviews',
        loadComponent: () => import('./pages/inbound/reviews.component').then((m) => m.ReviewsComponent),
      },
      {
        path: 'inbound/bookings',
        loadComponent: () =>
          import('./pages/inbound/bookings.component').then((m) => m.BookingsComponent),
      },
      {
        path: 'inbound/contacts',
        loadComponent: () =>
          import('./pages/inbound/contacts.component').then((m) => m.ContactsComponent),
      },
      {
        path: 'catalog/cities',
        loadComponent: () => import('./pages/catalog/cities-page.component').then((m) => m.CitiesPageComponent),
      },
      {
        path: 'catalog/real-estate-filters',
        loadComponent: () =>
          import('./pages/catalog/real-estate-filters-page.component').then((m) => m.RealEstateFiltersPageComponent),
      },
      {
        path: 'catalog/tour-filters',
        loadComponent: () =>
          import('./pages/catalog/tour-filters-page.component').then((m) => m.TourFiltersPageComponent),
      },
      {
        path: 'catalog/projects',
        loadComponent: () =>
          import('./pages/catalog/projects-page.component').then((m) => m.ProjectsPageComponent),
      },
      {
        path: 'catalog/projects/:projectId',
        loadComponent: () =>
          import('./pages/catalog/project-detail-page.component').then((m) => m.ProjectDetailPageComponent),
      },
      {
        path: 'catalog/tours',
        loadComponent: () => import('./pages/catalog/tours-page.component').then((m) => m.ToursPageComponent),
      },
      {
        path: 'catalog/offers',
        loadComponent: () => import('./pages/catalog/offers-page.component').then((m) => m.OffersPageComponent),
      },
      {
        path: 'catalog/vehicle-types',
        loadComponent: () =>
          import('./pages/catalog/vehicle-types-page.component').then((m) => m.VehicleTypesPageComponent),
      },
      {
        path: 'catalog/cars',
        loadComponent: () => import('./pages/catalog/cars-page.component').then((m) => m.CarsPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
