import { HttpInterceptorFn } from '@angular/common/http';
import { inject, LOCALE_ID } from '@angular/core';

/** Asks the API for content in the language of the current build (/en or /fr). */
export const acceptLanguageInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }
  const locale = inject(LOCALE_ID);
  return next(request.clone({ setHeaders: { 'Accept-Language': locale } }));
};
