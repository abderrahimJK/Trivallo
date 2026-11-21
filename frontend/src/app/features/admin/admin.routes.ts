import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/admin.guard';

/** Admin area (English only). Every page except "no access" requires the ADMIN role. */
export const adminRoutes: Routes = [
  {
    path: 'forbidden',
    title: 'No access · Trivallo admin',
    loadComponent: () => import('./layout/admin-forbidden-page').then((m) => m.AdminForbiddenPage),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        title: 'Dashboard · Trivallo admin',
        loadComponent: () => import('./dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'activities',
        title: 'Activities · Trivallo admin',
        loadComponent: () =>
          import('./activities/activity-list-page').then((m) => m.ActivityListPage),
      },
      {
        path: 'activities/new',
        title: 'New activity · Trivallo admin',
        loadComponent: () =>
          import('./activities/activity-form-page').then((m) => m.ActivityFormPage),
      },
      {
        path: 'activities/:id',
        title: 'Edit activity · Trivallo admin',
        loadComponent: () =>
          import('./activities/activity-form-page').then((m) => m.ActivityFormPage),
      },
      {
        path: 'cities',
        title: 'Cities · Trivallo admin',
        loadComponent: () => import('./cities/city-list-page').then((m) => m.CityListPage),
      },
      {
        path: 'cities/new',
        title: 'New city · Trivallo admin',
        loadComponent: () => import('./cities/city-form-page').then((m) => m.CityFormPage),
      },
      {
        path: 'cities/:id',
        title: 'Edit city · Trivallo admin',
        loadComponent: () => import('./cities/city-form-page').then((m) => m.CityFormPage),
      },
      {
        path: 'categories',
        title: 'Categories · Trivallo admin',
        loadComponent: () =>
          import('./categories/category-list-page').then((m) => m.CategoryListPage),
      },
      {
        path: 'categories/new',
        title: 'New category · Trivallo admin',
        loadComponent: () =>
          import('./categories/category-form-page').then((m) => m.CategoryFormPage),
      },
      {
        path: 'categories/:id',
        title: 'Edit category · Trivallo admin',
        loadComponent: () =>
          import('./categories/category-form-page').then((m) => m.CategoryFormPage),
      },
    ],
  },
];
