import { HttpParams } from '@angular/common/http';
import { ActivityFilters } from './catalog.models';

/**
 * URLs of the public catalogue API. Paths are relative ("/api/v1/..."): the browser
 * reaches them through Nginx (or the dev-server proxy), and during SSR
 * {@link apiOriginInterceptor} points them at the backend directly.
 */
export const catalogApi = {
  cities: () => '/api/v1/cities',
  city: (slug: string) => `/api/v1/cities/${encodeURIComponent(slug)}`,
  categories: () => '/api/v1/categories',
  activities: () => '/api/v1/activities',
  activity: (slug: string) => `/api/v1/activities/${encodeURIComponent(slug)}`,
};

export function toActivityParams(filters: ActivityFilters): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
