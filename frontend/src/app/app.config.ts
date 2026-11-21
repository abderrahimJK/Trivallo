import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  DOCUMENT,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
import { routes } from './app.routes';
import { SelectivePreloading } from './core/routing/selective-preloading';
import { adminTokenInterceptor } from './core/auth/admin-token.interceptor';
import { acceptLanguageInterceptor } from './core/http/accept-language.interceptor';
import { apiOriginInterceptor } from './core/http/api-origin.interceptor';
import { API_ORIGIN } from './core/http/api-origin.interceptor';
import { SITE_ORIGIN } from './core/i18n/locales';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Route params and query params arrive as component inputs.
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Pages are small; fetch them after first load so later navigation is instant (admin excluded).
      withPreloading(SelectivePreloading),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([acceptLanguageInterceptor, adminTokenInterceptor, apiOriginInterceptor]),
    ),
    // Responses fetched during SSR are embedded in the HTML and reused by the browser.
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: false,
        // Spring Security marks every response no-store by default; public catalogue GETs are safe to hand over.
        includeNonCacheableRequests: true,
      }),
    ),
    { provide: SITE_ORIGIN, useFactory: () => inject(DOCUMENT).location.origin },
    { provide: API_ORIGIN, useFactory: () => inject(DOCUMENT).location.origin },
  ],
};
