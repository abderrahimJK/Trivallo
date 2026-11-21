import { Routes } from '@angular/router';
import { accountGuard } from '../../core/auth/signed-in.guard';

export const accountRoutes: Routes = [
  {
    path: '',
    canActivate: [accountGuard],
    loadComponent: () => import('./account-page').then((m) => m.AccountPage),
  },
];
