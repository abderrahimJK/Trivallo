import { InjectionToken } from '@angular/core';

/**
 * True when the app was started on a page that needs sign-in (/account or /admin), so the
 * OIDC providers were loaded at bootstrap (see main.ts). Other visits start without them and
 * never download the library.
 */
export const SIGN_IN_ENABLED = new InjectionToken<boolean>('SIGN_IN_ENABLED', {
  factory: () => false,
});

/** Only these API calls get the bearer token (see adminTokenInterceptor); public calls stay anonymous. */
export const SECURED_API_PREFIX = '/api/v1/admin/';

/** "/account" or "/admin" (and below), also under a locale base href such as "/fr/admin". */
export function needsSignIn(pathname: string): boolean {
  return /^\/(?:[a-z]{2}\/)?(?:admin|account)(?:\/|$)/.test(pathname);
}
