import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';

/**
 * Origin that relative /api URLs are sent to.
 * - Browser: the site's own origin (Nginx routes /api to the backend).
 * - Server: the backend directly, e.g. http://backend:8080 inside Docker.
 *
 * During SSR the server maps this origin back to the public site origin
 * (HTTP_TRANSFER_CACHE_ORIGIN_MAP), so responses fetched on the server are reused
 * by the browser after hydration instead of being requested a second time.
 */
export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN');

export const apiOriginInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }
  return next(request.clone({ url: inject(API_ORIGIN) + request.url }));
};
