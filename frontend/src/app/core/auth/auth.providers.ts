import { EnvironmentProviders, Provider } from '@angular/core';
import { provideAuth, StsConfigLoader } from 'angular-auth-oidc-client';
import { ADMIN_AUTH_ENABLED } from './admin-area';
import { authConfigLoader } from './auth.config';

/**
 * Sign-in providers, added at bootstrap only when the app starts on an admin URL.
 * The library's services are root-scoped, so they cannot be provided on the lazy route instead.
 */
export const adminAuthProviders: (Provider | EnvironmentProviders)[] = [
  provideAuth({ loader: { provide: StsConfigLoader, useFactory: authConfigLoader } }),
  { provide: ADMIN_AUTH_ENABLED, useValue: true },
];
