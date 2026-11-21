import { inject, LOCALE_ID } from '@angular/core';
import { CanActivateFn, GuardResult, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AdminTokenSource } from './admin-token.interceptor';
import { SIGN_IN_ENABLED } from './auth-area';
import { KEYCLOAK_REALM_URL } from './auth.config';
import { SessionHint } from './session-hint';

const RETURN_URL_KEY = 'trv.auth.returnUrl';
const SIGN_IN_UNAVAILABLE_URL = '/account/unavailable';
export const ADMIN_ROLE = 'ADMIN';

/** Claims of a Keycloak access token that the frontend reads. */
export interface TokenClaims {
  name?: string;
  email?: string;
  preferred_username?: string;
  realm_access?: { roles?: string[] };
}

/** Any signed-in account (travellers and admins). Keycloak sends everyone back to /account. */
export const accountGuard: CanActivateFn = (route, state) =>
  signedIn(
    route.queryParamMap.has('code') && route.queryParamMap.has('state'),
    state.url,
    () => true,
  );

/**
 * Admin pages: signed in and the Keycloak realm role ADMIN, otherwise the "no access" page.
 * The backend enforces the same rule on /api/v1/admin/**; this guard only spares the user
 * a screen full of 403 errors.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return signedIn(false, state.url, (claims) =>
    hasAdminRole(claims) ? true : router.parseUrl('/admin/forbidden'),
  );
};

/**
 * Shared flow:
 * - App started on a public page (no sign-in providers loaded): full reload of the URL.
 * - Not signed in: remember the page, go to Keycloak (in the site's language), come back.
 * - Back from Keycloak (?code=&state= on /account): continue to the remembered page.
 * - Keycloak unreachable, or it refused the sign-in: the "sign-in unavailable" page. Without this
 *   the library fails silently and the visitor is left on an empty page.
 */
function signedIn(
  isCallback: boolean,
  url: string,
  allow: (claims: TokenClaims) => GuardResult,
): false | Observable<GuardResult> {
  if (!inject(SIGN_IN_ENABLED)) {
    location.assign(new URL(url.replace(/^\//, ''), document.baseURI));
    return false;
  }
  const oidc = inject(OidcSecurityService);
  const router = inject(Router);
  const hint = inject(SessionHint);
  const locale = inject(LOCALE_ID);
  inject(AdminTokenSource).register(() => oidc.getAccessToken());

  const unavailable = router.parseUrl(SIGN_IN_UNAVAILABLE_URL);

  // Fetching Keycloak's discovery document first turns "Keycloak is down" into an error we see.
  return oidc.preloadAuthWellKnownDocument().pipe(
    switchMap(() => oidc.checkAuth()),
    switchMap(({ isAuthenticated, errorMessage }) => {
      if (!isAuthenticated && isCallback && errorMessage) {
        // Keycloak came back with an error: retrying here would loop, so stop and explain.
        console.error('Sign-in failed after returning from Keycloak:', errorMessage);
        return of(unavailable);
      }
      if (!isAuthenticated) {
        hint.clear();
        sessionStorage.setItem(RETURN_URL_KEY, url);
        oidc.authorize(undefined, { customParams: { ui_locales: locale.slice(0, 2) } });
        return of(false);
      }
      return oidc.getPayloadFromAccessToken().pipe(
        map((claims: TokenClaims) => {
          hint.set(displayName(claims));
          if (isCallback) {
            const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
            sessionStorage.removeItem(RETURN_URL_KEY);
            return router.parseUrl(returnUrl ?? '/account');
          }
          return allow(claims);
        }),
      );
    }),
    catchError((error: unknown) => {
      console.error(`Sign-in service unreachable at ${KEYCLOAK_REALM_URL}`, error);
      return of(unavailable);
    }),
  );
}

export function hasAdminRole(claims: TokenClaims | null | undefined): boolean {
  return claims?.realm_access?.roles?.includes(ADMIN_ROLE) ?? false;
}

export function displayName(claims: TokenClaims | null | undefined): string {
  return claims?.name || claims?.preferred_username || claims?.email || '';
}
