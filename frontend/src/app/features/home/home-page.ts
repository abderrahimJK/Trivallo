import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catalogApi, toActivityParams } from '../../core/api/catalog-api';
import { ActivitySummary, Category, City, Page } from '../../core/api/catalog.models';
import { SeoService } from '../../core/seo/seo.service';
import { ActivityCard } from '../../shared/ui/activity-card';
import { CardSkeleton } from '../../shared/ui/card-skeleton';
import { CityCard } from '../../shared/ui/city-card';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'trv-home-page',
  imports: [FormsModule, RouterLink, ActivityCard, CardSkeleton, CityCard, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero with quick search -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-sand-100 via-sand-50 to-terracotta-400/20"
    >
      <div
        class="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center"
      >
        <div>
          <p
            class="text-sm font-semibold tracking-wide text-terracotta-600 uppercase"
            i18n="@@home.eyebrow"
          >
            Marrakech · Ouarzazate · Merzouga
          </p>
          <h1 class="mt-3 text-4xl leading-tight text-ink-900 sm:text-5xl" i18n="@@home.title">
            The best of Morocco, from the medina to the dunes
          </h1>
          <p class="mt-4 max-w-xl text-lg text-ink-700" i18n="@@home.subtitle">
            Hand-picked excursions and activities with local guides. Send a request, we confirm it,
            you pay on the day.
          </p>

          <form
            class="mt-8 grid gap-3 rounded-[var(--radius-card)] bg-white p-3 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_1fr_auto]"
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
            <button type="submit" class="btn-primary self-end py-2.5">
              <ng-container i18n="@@home.searchButton">Search</ng-container>
              <trv-icon name="arrow-right" class="size-4" />
            </button>
          </form>
        </div>

        <div class="hidden lg:block" aria-hidden="true">
          <div class="relative mx-auto aspect-square max-w-sm">
            <div class="absolute inset-0 rounded-full bg-terracotta-400/25"></div>
            <div class="absolute inset-10 rounded-full bg-terracotta-500/30"></div>
            <trv-icon name="dune" class="absolute inset-24 text-terracotta-600" />
          </div>
        </div>
      </div>
    </section>

    <!-- Cities -->
    <section class="container-page mt-16">
      <div class="flex items-end justify-between gap-4">
        <h2 class="text-3xl" i18n="@@home.citiesTitle">Where to go</h2>
      </div>
      <div class="mt-6 grid gap-5 sm:grid-cols-3">
        @for (city of cities.value() ?? []; track city.slug) {
          <trv-city-card [city]="city" />
        }
      </div>
    </section>

    <!-- Categories -->
    @if (categories.value(); as categoryList) {
      <section class="container-page mt-16">
        <h2 class="text-3xl" i18n="@@home.categoriesTitle">What do you feel like?</h2>
        <div class="mt-6 flex flex-wrap gap-3">
          @for (category of categoryList; track category.slug) {
            <a
              [routerLink]="['/activities']"
              [queryParams]="{ category: category.slug }"
              class="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-terracotta-400 hover:text-terracotta-600"
            >
              <trv-icon [name]="category.icon ?? 'dune'" class="size-4" />
              {{ category.name }}
            </a>
          }
        </div>
      </section>
    }

    <!-- Latest activities -->
    <section class="container-page mt-16">
      <div class="flex items-end justify-between gap-4">
        <h2 class="text-3xl" i18n="@@home.latestTitle">New on Trivallo</h2>
        <a
          routerLink="/activities"
          class="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          <ng-container i18n="@@home.seeAll">See all</ng-container>
          <trv-icon name="arrow-right" class="size-4" />
        </a>
      </div>
      <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @if (latest.hasValue()) {
          @for (activity of latest.value().content; track activity.slug) {
            <trv-activity-card [activity]="activity" />
          }
        } @else if (latest.isLoading()) {
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <trv-card-skeleton />
          }
        }
      </div>
    </section>

    <!-- How it works -->
    <section class="container-page mt-20">
      <h2 class="text-3xl" i18n="@@home.howTitle">How it works</h2>
      <ol class="mt-6 grid gap-5 sm:grid-cols-3">
        @for (step of steps; track step.title; let index = $index) {
          <li class="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
            <span
              class="flex size-9 items-center justify-center rounded-full bg-teal-700 font-semibold text-white"
              >{{ index + 1 }}</span
            >
            <h3 class="mt-4 font-sans text-lg font-semibold">{{ step.title }}</h3>
            <p class="mt-1 text-sm text-ink-500">{{ step.text }}</p>
          </li>
        }
      </ol>
    </section>
  `,
})
export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly cities = httpResource<City[]>(() => catalogApi.cities());
  protected readonly categories = httpResource<Category[]>(() => catalogApi.categories());
  protected readonly latest = httpResource<Page<ActivitySummary>>(() => ({
    url: catalogApi.activities(),
    params: toActivityParams({ size: 6 }),
  }));

  protected selectedCity = '';
  protected selectedCategory = '';

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
