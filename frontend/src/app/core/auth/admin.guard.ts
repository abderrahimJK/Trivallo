import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, of, switchMap } from 'rxjs';
import { ADMIN_AUTH_ENABLED } from './admin-area';
import { AdminTokenSource } from './admin-token.interceptor';

const RETURN_URL_KEY = 'trv.admin.returnUrl';
export const ADMIN_ROLE = 'ADMIN';

/**
 * Admin pages need a signed-in user with the Keycloak realm role ADMIN.
 * - Not signed in: remember the page, go to Keycloak, come back here.
 * - Signed in without the role: show the "no access" page.
 * - App started on a public page (no sign-in providers loaded): full reload of the admin URL.
 * The backend enforces the same rule on /api/v1/admin/**; this guard only spares the
 * user a screen full of 403 errors.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  if (!inject(ADMIN_AUTH_ENABLED)) {
    // Started on a public page: reload so main.ts loads the sign-in providers.
    location.assign(new URL(state.url.replace(/^\//, ''), document.baseURI));
    return false;
  }
  const oidc = inject(OidcSecurityService);
  const router = inject(Router);
  inject(AdminTokenSource).register(() => oidc.getAccessToken());

  return oidc.checkAuth().pipe(
    switchMap(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        sessionStorage.setItem(RETURN_URL_KEY, state.url);
        oidc.authorize();
        return of(false);
      }
      return oidc.getPayloadFromAccessToken().pipe(
        map((payload) => {
          if (!hasAdminRole(payload)) {
            return router.parseUrl('/admin/forbidden');
          }
          // Back from Keycloak (?code=&state=): continue to the page the admin asked for.
          const isCallback = route.queryParamMap.has('code') && route.queryParamMap.has('state');
          const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
          sessionStorage.removeItem(RETURN_URL_KEY);
          if (isCallback) {
            return router.parseUrl(returnUrl ?? '/admin');
          }
          return true;
        }),
      );
    }),
  );
};

function hasAdminRole(payload: unknown): boolean {
  const roles = (payload as { realm_access?: { roles?: string[] } } | null)?.realm_access?.roles;
  return Array.isArray(roles) && roles.includes(ADMIN_ROLE);
}
