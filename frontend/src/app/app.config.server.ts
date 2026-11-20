import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_ORIGIN } from './core/http/api-origin.interceptor';
import { SITE_ORIGIN } from './core/i18n/locales';

// Where the Node server reaches the API (inside Docker: http://backend:8080).
const apiOrigin = process.env['API_ORIGIN'] ?? 'http://localhost:8080';
// Public origin of the site; also used for canonical/hreflang URLs. The request Host header is not trusted for this.
const siteOrigin = process.env['SITE_ORIGIN'] ?? 'http://localhost:4000';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_ORIGIN, useValue: apiOrigin },
    { provide: SITE_ORIGIN, useValue: siteOrigin },
    // Cache server responses under the URL the browser will request, so hydration reuses them.
    { provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP, useValue: { [apiOrigin]: siteOrigin } },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
