import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { catalogApi } from '../../core/api/catalog-api';
import { CityDetail } from '../../core/api/catalog.models';
import { isNotFound } from '../../core/http/http-errors';
import { SeoService } from '../../core/seo/seo.service';
import { cityChapter } from '../../shared/ui/city-chapter';
import { Dunes } from '../../shared/ui/dunes';
import { MediaFrame } from '../../shared/ui/media-frame';
import { ActivityBrowser } from '../activities/activity-browser';
import { toActivityFilters } from '../activities/query-filters';
import { NotFoundView } from '../not-found/not-found-view';

@Component({
  selector: 'trv-city-page',
  imports: [ActivityBrowser, Dunes, MediaFrame, NotFoundView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (city.hasValue()) {
      @let item = city.value();
      <section
        class="relative isolate overflow-hidden bg-gradient-to-br text-white"
        [class]="chapter().gradient"
      >
        @if (item.heroImageUrl) {
          <trv-media-frame
            class="absolute inset-0 -z-10"
            [src]="item.heroImageUrl"
            [alt]="item.name"
            [city]="item.slug"
            sizes="100vw"
            [priority]="true"
          />
          <div
            class="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/10"
          ></div>
        }
        <div class="container-page relative pt-14 pb-28 sm:pt-24 sm:pb-36">
          <p
            class="font-display pointer-events-none absolute top-4 right-4 text-[9rem] leading-none text-white/15 sm:right-8 sm:text-[16rem]"
            aria-hidden="true"
          >
            {{ chapter().number }}
          </p>
          <p class="eyebrow text-white/90">
            <ng-container i18n="@@chapter.label">Chapter {{ chapter().number }}</ng-container>
          </p>
          <h1 class="animate-rise mt-2 text-7xl sm:text-9xl">{{ item.name }}</h1>
          @if (item.description) {
            <p class="mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">{{ item.description }}</p>
          }
        </div>
        <trv-dunes class="absolute inset-x-0 bottom-0 h-16 text-background sm:h-24" />
      </section>

      <section class="container-page mt-8" aria-labelledby="city-activities">
        <h2
          id="city-activities"
          class="mb-6 text-5xl text-foreground sm:text-6xl"
          i18n="@@city.activitiesTitle"
        >
          Things to do in {{ item.name }}
        </h2>
        <trv-activity-browser [filters]="filters()" [fixedCity]="item.slug" />
      </section>
    } @else if (notFound()) {
      <trv-not-found-view />
    } @else if (city.isLoading()) {
      <div class="h-96 animate-pulse bg-muted"></div>
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
  protected readonly chapter = computed(() => cityChapter(this.slug()));

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
