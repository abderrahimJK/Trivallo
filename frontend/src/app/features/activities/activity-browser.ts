import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { catalogApi, toActivityParams } from '../../core/api/catalog-api';
import {
  ActivityFilters,
  ActivitySummary,
  Category,
  City,
  Page,
} from '../../core/api/catalog.models';
import { ActivityCard } from '../../shared/ui/activity-card';
import { CardSkeleton } from '../../shared/ui/card-skeleton';
import { EmptyState } from '../../shared/ui/empty-state';
import { Pagination } from '../../shared/ui/pagination';
import { ActivityFilterPanel } from './activity-filter-panel';

const PAGE_SIZE = 12;

/**
 * Filter panel + results grid + pagination. Filters come in from the page's query params
 * and go back out by navigating, so every filtered list has a shareable, crawlable URL.
 * Used by the activities page and, with a fixed city, by city pages.
 */
@Component({
  selector: 'trv-activity-browser',
  imports: [ActivityCard, ActivityFilterPanel, CardSkeleton, EmptyState, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside class="lg:sticky lg:top-24 lg:self-start">
        <trv-activity-filter-panel
          [filters]="filters()"
          [cities]="cities.value() ?? []"
          [categories]="categories.value() ?? []"
          [showCity]="!fixedCity()"
          [hasActiveFilters]="hasActiveFilters()"
          (changed)="applyFilters($event)"
          (clear)="clearFilters()"
        />
      </aside>

      <div>
        @if (results.hasValue()) {
          @let result = results.value();
          <p class="mb-4 text-sm text-ink-500" i18n="@@browser.count">
            {result.totalElements, plural,
              =0 {No activities}
              =1 {1 activity}
              other {{{result.totalElements}} activities}
            }
          </p>
          @if (result.content.length) {
            <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              @for (activity of result.content; track activity.slug) {
                <trv-activity-card [activity]="activity" />
              }
            </div>
            <trv-pagination
              class="mt-10 block"
              [page]="result.page"
              [totalPages]="result.totalPages"
            />
          } @else {
            <trv-empty-state
              i18n-title="@@browser.emptyTitle"
              title="Nothing matches these filters yet"
            >
              <ng-container i18n="@@browser.emptyText"
                >Try a different budget or duration, or clear the filters.</ng-container
              >
            </trv-empty-state>
          }
        } @else if (results.error()) {
          <trv-empty-state
            icon="x"
            i18n-title="@@browser.errorTitle"
            title="We couldn't load activities"
          >
            <ng-container i18n="@@browser.errorText"
              >Please refresh the page in a moment.</ng-container
            >
          </trv-empty-state>
        } @else {
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            @for (placeholder of [1, 2, 3, 4, 5, 6]; track placeholder) {
              <trv-card-skeleton />
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ActivityBrowser {
  readonly filters = input.required<ActivityFilters>();
  /** City slug for city pages; hides the city filter and always applies it. */
  readonly fixedCity = input<string | null>(null);

  private readonly router = inject(Router);

  protected readonly cities = httpResource<City[]>(() => catalogApi.cities());
  protected readonly categories = httpResource<Category[]>(() => catalogApi.categories());

  protected readonly results = httpResource<Page<ActivitySummary>>(() => ({
    url: catalogApi.activities(),
    params: toActivityParams({
      ...this.filters(),
      city: this.fixedCity() ?? this.filters().city,
      size: PAGE_SIZE,
    }),
  }));

  protected readonly hasActiveFilters = computed(() => {
    const { page, size, ...filters } = this.filters();
    return Object.entries(filters).some(
      ([key, value]) => value && !(key === 'city' && this.fixedCity()),
    );
  });

  protected applyFilters(change: Partial<ActivityFilters>): void {
    // Any filter change starts again from the first page.
    this.router.navigate([], {
      queryParams: { ...change, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    this.router.navigate([], { queryParams: {} });
  }
}
