import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catalogApi, toActivityParams } from '../../core/api/catalog-api';
import { ActivitySummary, Category, City, Page } from '../../core/api/catalog.models';
import { SeoService } from '../../core/seo/seo.service';
import { ActivityCard } from '../../shared/ui/activity-card';
import { CardSkeleton } from '../../shared/ui/card-skeleton';
import { CITY_ORDER } from '../../shared/ui/city-chapter';
import { FaqSection } from '../../shared/ui/faq-section';
import { Icon } from '../../shared/ui/icon';
import { MediaFrame } from '../../shared/ui/media-frame';

/**
 * Home: search hero, why book with us, destinations, popular trips, how it works, FAQ
 * (design-system/trivallo/MASTER.md, revision 2).
 */
@Component({
  selector: 'trv-home-page',
  imports: [FormsModule, RouterLink, ActivityCard, CardSkeleton, FaqSection, Icon, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero: wide image with the search box overlapping its bottom edge -->
    <section class="container-page pt-6">
      <!-- Deep Majorelle blue until a city photo is uploaded -->
      <div class="relative isolate overflow-hidden rounded-2xl bg-on-secondary">
        @if (heroImage(); as image) {
          <trv-media-frame
            class="absolute inset-0 -z-10"
            [src]="image"
            alt=""
            sizes="100vw"
            [priority]="true"
          />
          <div
            class="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/40 to-black/10"
          ></div>
        }
        <div class="px-6 pt-20 pb-28 text-white sm:px-12 sm:pt-28 sm:pb-36">
          <p class="font-semibold text-white/90" i18n="@@home.eyebrow">
            Marrakech · Ouarzazate · Merzouga
          </p>
          <h1 class="mt-3 max-w-3xl text-4xl text-white sm:text-6xl" i18n="@@home.title">
            Excursions and day trips in Morocco, with local guides
          </h1>
          <p class="mt-4 max-w-xl text-lg text-white/90" i18n="@@home.subtitle">
            Hand-picked excursions and activities with local guides. Send a request, we confirm it,
            you pay on the day.
          </p>
        </div>
      </div>

      <form
        class="relative mx-auto -mt-16 grid max-w-4xl gap-3 rounded-xl border border-border bg-card p-4 shadow-xl sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        (ngSubmit)="search()"
      >
        <label class="block">
          <span class="field-label" i18n="@@home.searchCity">Where</span>
          <select class="field" name="city" [(ngModel)]="selectedCity">
            <option value="" i18n="@@home.anyCity">Any city</option>
            @for (city of cities.value() ?? []; track city.slug) {
              <option [value]="city.slug">{{ city.name }}</option>
            }
          </select>
        </label>
        <label class="block">
          <span class="field-label" i18n="@@home.searchCategory">What</span>
          <select class="field" name="category" [(ngModel)]="selectedCategory">
            <option value="" i18n="@@home.anyCategory">Any experience</option>
            @for (category of categories.value() ?? []; track category.slug) {
              <option [value]="category.slug">{{ category.name }}</option>
            }
          </select>
        </label>
        <button type="submit" class="btn-cta">
          <trv-icon name="arrow-right" class="size-4" />
          <ng-container i18n="@@home.searchButton">Search</ng-container>
        </button>
      </form>
    </section>

    <!-- Why book with us -->
    <section class="container-page mt-16" aria-labelledby="why-title">
      <h2 id="why-title" class="sr-only" i18n="@@home.whyTitle">Why book with Trivallo</h2>
      <ul class="grid gap-8 sm:grid-cols-3">
        @for (point of reasons; track point.title) {
          <li class="flex gap-4">
            <span
              class="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary"
            >
              <trv-icon [name]="point.icon" class="size-6" />
            </span>
            <div>
              <h3 class="text-lg font-bold">{{ point.title }}</h3>
              <p class="mt-1 text-muted-foreground">{{ point.text }}</p>
            </div>
          </li>
        }
      </ul>
    </section>

    <!-- Destinations -->
    <section class="container-page mt-20" aria-labelledby="where-title">
      <h2 id="where-title" class="section-title" i18n="@@home.citiesTitle">Where you can go</h2>
      <div class="mt-6 grid gap-5 sm:grid-cols-3">
        @for (city of orderedCities(); track city.slug) {
          <a [routerLink]="['/cities', city.slug]" class="group block">
            <trv-media-frame
              class="aspect-[4/3] rounded-xl"
              [src]="city.heroImageUrl"
              [alt]="city.name"
              icon="kasbah"
              [city]="city.slug"
            />
            <h3 class="mt-4 text-2xl decoration-2 underline-offset-4 group-hover:underline">
              {{ city.name }}
            </h3>
            @if (city.description) {
              <p class="mt-1 line-clamp-2 text-muted-foreground">{{ city.description }}</p>
            }
            <span class="link mt-2 inline-flex min-h-11 items-center gap-1">
              <ng-container i18n="@@cityCard.explore">See trips</ng-container>
              <trv-icon
                name="arrow-right"
                class="size-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </span>
          </a>
        }
      </div>
    </section>

    <!-- Popular trips -->
    <section class="container-page mt-20" aria-labelledby="popular-title">
      <div class="flex items-end justify-between gap-4">
        <h2 id="popular-title" class="section-title" i18n="@@home.latestTitle">Popular trips</h2>
        <a routerLink="/activities" class="link inline-flex min-h-11 items-center gap-1">
          <ng-container i18n="@@home.seeAll">See all trips</ng-container>
          <trv-icon name="arrow-right" class="size-4" />
        </a>
      </div>
      <div class="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        @if (popular.hasValue()) {
          @for (activity of popular.value().content; track activity.slug) {
            <trv-activity-card [activity]="activity" />
          }
        } @else if (popular.isLoading()) {
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <trv-card-skeleton />
          }
        }
      </div>
    </section>

    <!-- How it works -->
    <section class="mt-20 bg-muted py-16" aria-labelledby="how-title">
      <div class="container-page">
        <h2 id="how-title" class="section-title" i18n="@@home.howTitle">How it works</h2>
        <ol class="mt-8 grid gap-8 sm:grid-cols-3">
          @for (step of steps; track step.title; let index = $index) {
            <li>
              <span
                class="flex size-10 items-center justify-center rounded-full bg-foreground font-bold text-background"
                >{{ index + 1 }}</span
              >
              <h3 class="mt-4 text-lg font-bold">{{ step.title }}</h3>
              <p class="mt-1 text-muted-foreground">{{ step.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- Categories -->
    @if (categories.value(); as categoryList) {
      <section class="container-page mt-20" aria-labelledby="categories-title">
        <h2 id="categories-title" class="section-title" i18n="@@home.categoriesTitle">
          What do you feel like?
        </h2>
        <div class="mt-6 flex flex-wrap gap-3">
          @for (category of categoryList; track category.slug) {
            <a
              [routerLink]="['/activities']"
              [queryParams]="{ category: category.slug }"
              class="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 font-semibold transition-colors duration-200 hover:border-foreground"
            >
              <trv-icon [name]="category.icon ?? 'dune'" class="size-5" />
              {{ category.name }}
            </a>
          }
        </div>
      </section>
    }

    <!-- FAQ -->
    <trv-faq-section class="container-page mt-20" />
  `,
})
export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly cities = httpResource<City[]>(() => catalogApi.cities());
  protected readonly categories = httpResource<Category[]>(() => catalogApi.categories());
  protected readonly popular = httpResource<Page<ActivitySummary>>(() => ({
    url: catalogApi.activities(),
    params: toActivityParams({ size: 6 }),
  }));

  /** Launch cities first, in travel order, then any city added later. */
  protected readonly orderedCities = computed(() => {
    const order = (slug: string) => {
      const index = CITY_ORDER.indexOf(slug);
      return index === -1 ? CITY_ORDER.length : index;
    };
    return [...(this.cities.value() ?? [])].sort((a, b) => order(a.slug) - order(b.slug));
  });

  /** The first city photo available, so the hero shows a real place as soon as one is uploaded. */
  protected readonly heroImage = computed(
    () => this.orderedCities().find((city) => city.heroImageUrl)?.heroImageUrl ?? null,
  );

  protected selectedCity = '';
  protected selectedCategory = '';

  protected readonly reasons = [
    {
      icon: 'users',
      title: $localize`:@@home.why1Title:Local guides`,
      text: $localize`:@@home.why1Text:Every trip is run by guides who live where they take you.`,
    },
    {
      icon: 'check',
      title: $localize`:@@home.why2Title:Nothing to pay online`,
      text: $localize`:@@home.why2Text:Request a date, we confirm it, you pay on the day.`,
    },
    {
      icon: 'map-pin',
      title: $localize`:@@home.why3Title:Hand-picked trips`,
      text: $localize`:@@home.why3Text:A short list of trips we know well, not a marketplace.`,
    },
  ];

  protected readonly steps = [
    {
      title: $localize`:@@home.step1Title:Pick an experience`,
      text: $localize`:@@home.step1Text:Browse tours and activities chosen with local guides.`,
    },
    {
      title: $localize`:@@home.step2Title:Send a request`,
      text: $localize`:@@home.step2Text:Choose a date and group size. No payment online.`,
    },
    {
      title: $localize`:@@home.step3Title:We confirm, you go`,
      text: $localize`:@@home.step3Text:We confirm by email with the guide. You pay on the day.`,
    },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: $localize`:@@home.seoTitle:Excursions and activities in Morocco`,
      description: $localize`:@@home.seoDescription:Book the best excursions and activities in Marrakech, Ouarzazate and Merzouga: desert tours, hot-air balloons, day trips and cooking classes.`,
    });
  }

  protected search(): void {
    this.router.navigate(['/activities'], {
      queryParams: { city: this.selectedCity || null, category: this.selectedCategory || null },
    });
  }
}
