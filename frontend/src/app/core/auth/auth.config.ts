import { DOCUMENT, inject } from '@angular/core';
import { LogLevel, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';

/**
 * Keycloak realm that signs the admin's tokens. Local value for now: the production
 * domain is decided with the deployment (week 4) and will replace this constant.
 */
export const KEYCLOAK_REALM_URL = 'http://localhost:8081/realms/trivallo';

/**
 * Builds the OIDC config when it is first needed (in the browser, on an admin page), so
 * redirect URLs follow the current origin and locale base href (/en/ or /fr/).
 */
export function authConfigLoader(): StsConfigLoader {
  const baseUri = inject(DOCUMENT).baseURI;
  return new StsConfigStaticLoader({
    authority: KEYCLOAK_REALM_URL,
    clientId: 'trivallo-web',
    redirectUrl: `${baseUri}admin`,
    postLogoutRedirectUri: baseUri,
    scope: 'openid profile email',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    // adminGuard decides where to go after sign-in; the library would otherwise navigate to "/".
    triggerAuthorizationResultEvent: true,
    logLevel: LogLevel.Warn,
  });
}
