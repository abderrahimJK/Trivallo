import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../../../core/api/catalog.models';
import {
  ActivityAdmin,
  ActivityAdminRequest,
  ActivityAdminSummary,
  ActivityStatus,
  CategoryAdmin,
  CategoryAdminRequest,
  CityAdmin,
  CityAdminRequest,
} from './admin.models';

const BASE = '/api/v1/admin';

/** URLs for reads (used with httpResource, which re-fetches when its inputs change). */
export const adminApi = {
  activities: () => `${BASE}/activities`,
  activityStats: () => `${BASE}/activities/stats`,
  activity: (id: number) => `${BASE}/activities/${id}`,
  cities: () => `${BASE}/cities`,
  categories: () => `${BASE}/categories`,
};

export interface AdminActivityQuery {
  status: ActivityStatus | '';
  city: string;
  page: number;
}

export function toAdminActivityParams(query: AdminActivityQuery): HttpParams {
  let params = new HttpParams().set('page', query.page).set('size', 20);
  if (query.status) params = params.set('status', query.status);
  if (query.city) params = params.set('city', query.city);
  return params;
}

/** Writes. The bearer token is added by the OIDC interceptor for every /api/v1/admin/ call. */
@Injectable({ providedIn: 'root' })
export class AdminWriteApi {
  private readonly http = inject(HttpClient);

  createActivity(body: ActivityAdminRequest): Observable<ActivityAdmin> {
    return this.http.post<ActivityAdmin>(adminApi.activities(), body);
  }

  updateActivity(id: number, body: ActivityAdminRequest): Observable<ActivityAdmin> {
    return this.http.put<ActivityAdmin>(adminApi.activity(id), body);
  }

  changeStatus(id: number, status: ActivityStatus): Observable<ActivityAdmin> {
    return this.http.put<ActivityAdmin>(`${adminApi.activity(id)}/status`, { status });
  }

  addImage(id: number, file: File, altText: string): Observable<ActivityAdmin> {
    const form = new FormData();
    form.append('file', file);
    if (altText.trim()) form.append('altText', altText.trim());
    return this.http.post<ActivityAdmin>(`${adminApi.activity(id)}/images`, form);
  }

  reorderImages(id: number, imageIds: number[]): Observable<ActivityAdmin> {
    return this.http.put<ActivityAdmin>(`${adminApi.activity(id)}/images/order`, { imageIds });
  }

  deleteImage(id: number, imageId: number): Observable<ActivityAdmin> {
    return this.http.delete<ActivityAdmin>(`${adminApi.activity(id)}/images/${imageId}`);
  }

  createCity(body: CityAdminRequest): Observable<CityAdmin> {
    return this.http.post<CityAdmin>(adminApi.cities(), body);
  }

  updateCity(id: number, body: CityAdminRequest): Observable<CityAdmin> {
    return this.http.put<CityAdmin>(`${adminApi.cities()}/${id}`, body);
  }

  replaceCityHero(id: number, file: File): Observable<CityAdmin> {
    const form = new FormData();
    form.append('file', file);
    return this.http.put<CityAdmin>(`${adminApi.cities()}/${id}/hero-image`, form);
  }

  createCategory(body: CategoryAdminRequest): Observable<CategoryAdmin> {
    return this.http.post<CategoryAdmin>(adminApi.categories(), body);
  }

  updateCategory(id: number, body: CategoryAdminRequest): Observable<CategoryAdmin> {
    return this.http.put<CategoryAdmin>(`${adminApi.categories()}/${id}`, body);
  }
}

export type { Page };
