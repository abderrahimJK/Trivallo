import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { catalogApi } from '../../core/api/catalog-api';
import { CityDetail } from '../../core/api/catalog.models';
import { isNotFound } from '../../core/http/http-errors';
import { SeoService } from '../../core/seo/seo.service';
import { MediaFrame } from '../../shared/ui/media-frame';
import { ActivityBrowser } from '../activities/activity-browser';
import { toActivityFilters } from '../activities/query-filters';
import { NotFoundView } from '../not-found/not-found-view';

@Component({
  selector: 'trv-city-page',
  imports: [ActivityBrowser, MediaFrame, NotFoundView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (city.hasValue()) {
      @let item = city.value();
      <section class="relative isolate overflow-hidden">
        <trv-media-frame
          class="absolute inset-0 -z-10"
          [src]="item.heroImageUrl"
          [alt]="item.name"
          icon="kasbah"
          [eager]="true"
        />
        <div
          class="absolute inset-0 -z-10 bg-gradient-to-t from-ink-900/75 via-ink-900/30 to-transparent"
        ></div>
        <div class="container-page flex min-h-64 flex-col justify-end py-10 text-white sm:min-h-80">
          <h1 class="text-4xl sm:text-5xl">{{ item.name }}</h1>
          @if (item.description) {
            <p class="mt-3 max-w-2xl text-lg text-white/90">{{ item.description }}</p>
          }
        </div>
      </section>

      <section class="container-page mt-10">
        <h2 class="mb-6 text-3xl" i18n="@@city.activitiesTitle">Things to do in {{ item.name }}</h2>
        <trv-activity-browser [filters]="filters()" [fixedCity]="item.slug" />
      </section>
    } @else if (notFound()) {
      <trv-not-found-view />
    } @else if (city.isLoading()) {
      <div class="h-80 animate-pulse bg-sand-100"></div>
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
