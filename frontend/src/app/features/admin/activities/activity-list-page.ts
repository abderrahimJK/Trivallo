import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Page } from '../../../core/api/catalog.models';
import { adminApi, toAdminActivityParams } from '../api/admin-api';
import { ActivityAdminSummary, ActivityStatus, CityAdmin, englishName } from '../api/admin.models';
import { AdminPageHeader } from '../ui/page-header';
import { StatusBadge } from '../ui/status-badge';

const STATUSES: ActivityStatus[] = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];

/** All activities, newest change first. Filters live in the URL so a filtered view can be shared. */
@Component({
  selector: 'trv-activity-list-page',
  imports: [RouterLink, CurrencyPipe, DatePipe, AdminPageHeader, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <trv-admin-page-header title="Activities">
      <a routerLink="/admin/activities/new" class="btn-cta">New activity</a>
    </trv-admin-page-header>

    <div class="mb-4 flex flex-wrap gap-3">
      <label class="w-full sm:w-48">
        <span class="field-label">Status</span>
        <select
          class="field"
          [value]="status() ?? ''"
          (change)="setFilter('status', $any($event.target).value)"
        >
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s.charAt(0) + s.slice(1).toLowerCase() }}</option>
          }
        </select>
      </label>
      <label class="w-full sm:w-48">
        <span class="field-label">City</span>
        <select
          class="field"
          [value]="city() ?? ''"
          (change)="setFilter('city', $any($event.target).value)"
        >
          <option value="">All cities</option>
          @for (c of cities.value() ?? []; track c.id) {
            <option [value]="c.slug">{{ name(c) }}</option>
          }
        </select>
      </label>
    </div>

    <div class="overflow-x-auto rounded-xl border border-border bg-background">
      <table class="w-full min-w-[52rem] text-left text-sm">
        <thead class="border-b border-border text-muted-foreground">
          <tr>
            <th scope="col" class="px-4 py-3 font-semibold">Activity</th>
            <th scope="col" class="px-4 py-3 font-semibold">City</th>
            <th scope="col" class="px-4 py-3 font-semibold">Status</th>
            <th scope="col" class="px-4 py-3 text-right font-semibold">Adult price</th>
            <th scope="col" class="px-4 py-3 font-semibold">Needs</th>
            <th scope="col" class="px-4 py-3 font-semibold">Updated</th>
          </tr>
        </thead>
        <tbody>
          @if (activities.isLoading() && !activities.hasValue()) {
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">Loading…</td>
            </tr>
          } @else if (activities.error()) {
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-red-800" role="alert">
                Activities could not be loaded.
                <button type="button" class="link" (click)="activities.reload()">Try again</button>
              </td>
            </tr>
          } @else {
            @for (a of activities.value()?.content ?? []; track a.id) {
              <tr class="border-b border-border last:border-0 hover:bg-muted/60">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    @if (a.coverImageUrl) {
                      <img
                        [src]="a.coverImageUrl"
                        alt=""
                        class="size-12 shrink-0 rounded-md object-cover"
                      />
                    } @else {
                      <span class="size-12 shrink-0 rounded-md bg-muted" aria-hidden="true"></span>
                    }
                    <div class="min-w-0">
                      <a
                        [routerLink]="['/admin/activities', a.id]"
                        class="font-semibold hover:underline"
                        >{{ a.title }}</a
                      >
                      <p class="text-muted-foreground">
                        {{ a.categoryName }} ·
                        {{ a.type === 'EXCURSION' ? 'Excursion' : 'Activity' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">{{ a.cityName }}</td>
                <td class="px-4 py-3"><trv-status-badge [status]="a.status" /></td>
                <td class="px-4 py-3 text-right tabular-nums">
                  {{ a.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-2' : 'en' }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    @if (a.imageCount === 0) {
                      <span class="tag bg-amber-100 text-amber-900">Photos</span>
                    }
                    @if (a.frenchMissing) {
                      <span class="tag bg-amber-100 text-amber-900">French</span>
                    }
                    @if (a.imageCount > 0 && !a.frenchMissing) {
                      <span class="text-muted-foreground">–</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {{ a.updatedAt | date: 'd MMM y, HH:mm' : undefined : 'en' }}
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                  No activities match these filters.
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    @if (pageCount() > 1) {
      <nav aria-label="Pages" class="mt-4 flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          class="btn-outline"
          [disabled]="pageIndex() === 0"
          (click)="setFilter('page', pageIndex() - 1)"
        >
          Previous
        </button>
        <span class="text-muted-foreground">Page {{ pageIndex() + 1 }} of {{ pageCount() }}</span>
        <button
          type="button"
          class="btn-outline"
          [disabled]="pageIndex() + 1 >= pageCount()"
          (click)="setFilter('page', pageIndex() + 1)"
        >
          Next
        </button>
      </nav>
    }
  `,
})
export class ActivityListPage {
  private readonly router = inject(Router);

  /** Query params, bound by the router. */
  readonly status = input<ActivityStatus | ''>();
  readonly city = input<string>();
  readonly page = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });

  protected readonly statuses = STATUSES;
  protected readonly name = englishName;
  protected readonly pageIndex = computed(() => Math.max(0, this.page()));

  protected readonly cities = httpResource<CityAdmin[]>(() => adminApi.cities());
  protected readonly activities = httpResource<Page<ActivityAdminSummary>>(() => ({
    url: adminApi.activities(),
    params: toAdminActivityParams({
      status: this.status() ?? '',
      city: this.city() ?? '',
      page: this.pageIndex(),
    }),
  }));
  protected readonly pageCount = computed(() => this.activities.value()?.totalPages ?? 0);

  protected setFilter(key: 'status' | 'city' | 'page', value: string | number): void {
    const queryParams =
      key === 'page' ? { page: value || null } : { [key]: value || null, page: null };
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
