import { InjectionToken } from '@angular/core';

/**
 * True when the app was started on an admin URL, so the OIDC providers were loaded at
 * bootstrap (see main.ts). Public visits start without them and never download the library.
 */
export const ADMIN_AUTH_ENABLED = new InjectionToken<boolean>('ADMIN_AUTH_ENABLED', {
  factory: () => false,
});

/** Only these API calls get the bearer token (see adminTokenInterceptor); public calls stay anonymous. */
export const SECURED_API_PREFIX = '/api/v1/admin/';

/** "/admin", "/admin/...", also under a locale base href such as "/fr/admin". */
export function isAdminPath(pathname: string): boolean {
  return /^\/(?:[a-z]{2}\/)?admin(?:\/|$)/.test(pathname);
}
