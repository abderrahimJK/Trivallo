import { EnvironmentProviders, Provider } from '@angular/core';
import { provideAuth, StsConfigLoader } from 'angular-auth-oidc-client';
import { SIGN_IN_ENABLED } from './auth-area';
import { authConfigLoader } from './auth.config';

/**
 * Sign-in providers, added at bootstrap only when the app starts on /account or /admin.
 * The library's services are root-scoped, so they cannot be provided on the lazy route instead.
 */
export const authProviders: (Provider | EnvironmentProviders)[] = [
  provideAuth({ loader: { provide: StsConfigLoader, useFactory: authConfigLoader } }),
  { provide: SIGN_IN_ENABLED, useValue: true },
];
