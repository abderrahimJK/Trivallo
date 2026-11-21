import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { SECURED_API_PREFIX } from './admin-area';

/**
 * Where the admin's access token comes from. The admin area registers the OIDC library here
 * when it loads, so the library stays in the lazy admin bundle: public pages never download it
 * (it would add ~140 kB to every visitor's first load).
 */
@Injectable({ providedIn: 'root' })
export class AdminTokenSource {
  private source: (() => Observable<string>) | null = null;

  register(source: () => Observable<string>): void {
    this.source = source;
  }

  token(): Observable<string> | null {
    return this.source?.() ?? null;
  }
}

/**
 * Adds the admin's bearer token to /api/v1/admin/ calls (and to nothing else).
 * Runs before apiOriginInterceptor, while the URL is still relative.
 */
export const adminTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = request.url.startsWith(SECURED_API_PREFIX)
    ? inject(AdminTokenSource).token()
    : null;
  if (!token) {
    return next(request);
  }
  return token.pipe(
    switchMap((value) =>
      next(value ? request.clone({ setHeaders: { Authorization: `Bearer ${value}` } }) : request),
    ),
  );
};
