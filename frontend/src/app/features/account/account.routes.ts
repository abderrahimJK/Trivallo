import { Routes } from '@angular/router';
import { accountGuard } from '../../core/auth/signed-in.guard';

export const accountRoutes: Routes = [
  {
    // Not guarded: shown when the guard cannot reach Keycloak.
    path: 'unavailable',
    loadComponent: () => import('./sign-in-unavailable-page').then((m) => m.SignInUnavailablePage),
  },
  {
    path: '',
    canActivate: [accountGuard],
    loadComponent: () => import('./account-page').then((m) => m.AccountPage),
  },
];
