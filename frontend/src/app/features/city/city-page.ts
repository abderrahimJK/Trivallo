import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { catalogApi, toActivityParams } from '../../core/api/catalog-api';
import { ActivitySummary, CityDetail, Page } from '../../core/api/catalog.models';
import { isNotFound } from '../../core/http/http-errors';
import { SeoService } from '../../core/seo/seo.service';
import { Breadcrumb } from '../../shared/ui/breadcrumb';
import { FaqSection } from '../../shared/ui/faq-section';
import { MediaFrame } from '../../shared/ui/media-frame';
import { ActivityBrowser } from '../activities/activity-browser';
import { toActivityFilters } from '../activities/query-filters';
import { NotFoundView } from '../not-found/not-found-view';

@Component({
  selector: 'trv-city-page',
  imports: [ActivityBrowser, Breadcrumb, FaqSection, MediaFrame, NotFoundView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (city.hasValue()) {
      @let item = city.value();
      <div class="container-page pt-2">
        <trv-breadcrumb [crumbs]="[{ label: item.name }]" />
        <div class="mt-2 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 class="text-4xl sm:text-6xl">{{ item.name }}</h1>
            @if (item.description) {
              <p class="mt-3 max-w-3xl text-lg text-muted-foreground">{{ item.description }}</p>
            }
          </div>
          <!-- At a glance: facts we can state for every destination -->
          <dl class="grid grid-cols-2 gap-4 rounded-xl bg-muted p-5 text-sm">
            <div>
              <dt class="text-muted-foreground" i18n="@@city.glanceTrips">Trips</dt>
              <dd class="text-xl font-extrabold">{{ tripCount.value()?.totalElements ?? '–' }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground" i18n="@@city.glanceCurrency">Prices in</dt>
              <dd class="text-xl font-extrabold">EUR</dd>
            </div>
            <div class="col-span-2">
              <dt class="text-muted-foreground" i18n="@@city.glancePayment">Payment</dt>
              <dd class="font-semibold" i18n="@@city.glancePaymentValue">
                On the day, to your guide
              </dd>
            </div>
          </dl>
        </div>

        <trv-media-frame
          class="mt-8 aspect-[16/9] rounded-2xl sm:aspect-[21/8]"
          [src]="item.heroImageUrl"
          [alt]="item.name"
          icon="kasbah"
          [city]="item.slug"
          sizes="100vw"
          [priority]="true"
        />

        <section class="mt-14" aria-labelledby="city-activities">
          <h2 id="city-activities" class="section-title mb-4" i18n="@@city.activitiesTitle">
            Our trips in {{ item.name }}
          </h2>
          <trv-activity-browser [filters]="filters()" [fixedCity]="item.slug" />
        </section>

        <trv-faq-section class="mt-20" />
      </div>
    } @else if (notFound()) {
      <trv-not-found-view />
    } @else if (city.isLoading()) {
      <div class="container-page pt-6">
        <div class="h-12 w-1/3 animate-pulse rounded bg-muted"></div>
        <div class="mt-8 aspect-[21/8] animate-pulse rounded-2xl bg-muted"></div>
      </div>
    }
  `,
})
export class CityPage {
  // Route param and query params, bound by withComponentInputBinding().
  readonly slug = input.required<string>();
  readonly category = input<string>();
  readonly type = input<string>();
  readonly maxPrice = input<string>();
  readonly maxDuration = input<string>();
  readonly page = input<string>();

  private readonly seo = inject(SeoService);

  protected readonly city = httpResource<CityDetail>(() => catalogApi.city(this.slug()));
  protected readonly notFound = computed(() => isNotFound(this.city.error()));
  /** Unfiltered trip count for "at a glance" (the city DTO has none); one tiny request. */
  protected readonly tripCount = httpResource<Page<ActivitySummary>>(() => ({
    url: catalogApi.activities(),
    params: toActivityParams({ city: this.slug(), size: 1 }),
  }));

  protected readonly filters = computed(() =>
    toActivityFilters({
      category: this.category(),
      type: this.type(),
      maxPrice: this.maxPrice(),
      maxDuration: this.maxDuration(),
      page: this.page(),
    }),
  );

  constructor() {
    effect(() => {
      if (this.city.hasValue()) {
        const city = this.city.value();
        this.seo.update({
          title: city.metaTitle ?? city.name,
          description: city.metaDescription ?? city.description,
          imageUrl: city.heroImageUrl,
        });
      }
    });
  }
}
