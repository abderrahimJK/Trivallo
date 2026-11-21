import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'activities',
    loadComponent: () =>
      import('./features/activities/activities-page').then((m) => m.ActivitiesPage),
  },
  {
    path: 'activities/:slug',
    loadComponent: () =>
      import('./features/activity-detail/activity-detail-page').then((m) => m.ActivityDetailPage),
  },
  {
    path: 'cities/:slug',
    loadComponent: () => import('./features/city/city-page').then((m) => m.CityPage),
  },
  {
    path: 'account',
    data: { preload: false },
    // Lazy like the admin: the guard brings the sign-in library, which public pages never load.
    loadChildren: () => import('./features/account/account.routes').then((m) => m.accountRoutes),
  },
  {
    path: 'admin',
    data: { preload: false },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
