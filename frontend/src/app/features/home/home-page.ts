import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catalogApi } from '../../core/api/catalog-api';
import { Category, City } from '../../core/api/catalog.models';
import { SeoService } from '../../core/seo/seo.service';
import { CHAPTER_ORDER } from '../../shared/ui/city-chapter';
import { Dunes } from '../../shared/ui/dunes';
import { Icon } from '../../shared/ui/icon';
import { HomeChapter } from './home-chapter';

/**
 * Scroll-triggered storytelling (design-system/trivallo/MASTER.md): aurora hero with search,
 * how it works, one chapter per city, the categories, then a closing call to action.
 */
@Component({
  selector: 'trv-home-page',
  imports: [FormsModule, RouterLink, Dunes, HomeChapter, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="aurora relative isolate overflow-hidden text-white">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-r from-[#082f49]/85 via-[#082f49]/35 to-transparent"
      ></div>
      <div class="container-page pt-14 pb-36 sm:pt-24 sm:pb-52">
        <p class="eyebrow animate-rise text-white/90" i18n="@@home.eyebrow">
          Marrakech · Ouarzazate · Merzouga
        </p>
        <h1
          class="text-balance animate-rise mt-4 max-w-4xl text-7xl [animation-delay:80ms] sm:text-8xl lg:text-[9.5rem]"
          i18n="@@home.title"
        >
          From the medina to the dunes
        </h1>
        <p
          class="animate-rise mt-5 max-w-xl text-lg text-white/90 [animation-delay:160ms] sm:text-xl"
          i18n="@@home.subtitle"
        >
          Hand-picked excursions and activities with local guides. Send a request, we confirm it,
          you pay on the day.
        </p>

        <form
          class="animate-rise mt-10 grid max-w-3xl gap-3 rounded-3xl border border-white/25 bg-white/10 p-3 shadow-xl backdrop-blur-md [animation-delay:240ms] sm:grid-cols-[1fr_1fr_auto] sm:p-4"
          (ngSubmit)="search()"
        >
          <label class="block">
            <span class="field-label text-white/90" i18n="@@home.searchCity">Where</span>
            <select class="field" name="city" [(ngModel)]="selectedCity">
              <option value="" i18n="@@home.anyCity">Any city</option>
              @for (city of cities.value() ?? []; track city.slug) {
                <option [value]="city.slug">{{ city.name }}</option>
              }
            </select>
          </label>
          <label class="block">
            <span class="field-label text-white/90" i18n="@@home.searchCategory">What</span>
            <select class="field" name="category" [(ngModel)]="selectedCategory">
              <option value="" i18n="@@home.anyCategory">Any experience</option>
              @for (category of categories.value() ?? []; track category.slug) {
                <option [value]="category.slug">{{ category.name }}</option>
              }
            </select>
          </label>
          <button type="submit" class="btn-accent self-end">
            <ng-container i18n="@@home.searchButton">Search</ng-container>
            <trv-icon name="arrow-right" class="size-4" />
          </button>
        </form>
      </div>
      <trv-dunes class="absolute inset-x-0 bottom-0 h-24 text-background sm:h-40" />
    </section>

    <!-- How it works -->
    <section class="container-page" aria-labelledby="how-title">
      <h2 id="how-title" class="sr-only" i18n="@@home.howTitle">How it works</h2>
      <ol class="grid gap-8 sm:grid-cols-3">
        @for (step of steps; track step.title; let index = $index) {
          <li class="flex gap-4">
            <span class="font-display text-7xl leading-[0.8] text-foreground" aria-hidden="true">{{
              index + 1
            }}</span>
            <div class="border-l-4 border-accent pl-4">
              <h3 class="text-lg font-bold text-foreground">{{ step.title }}</h3>
              <p class="mt-1 text-muted-foreground">{{ step.text }}</p>
            </div>
          </li>
        }
      </ol>
    </section>

    <!-- The story: one chapter per city -->
    <section class="mt-24" aria-labelledby="chapters-title">
      <div class="container-page mb-12 max-w-3xl text-center">
        <p class="eyebrow text-muted-foreground" i18n="@@home.chaptersEyebrow">Your journey</p>
        <h2
          id="chapters-title"
          class="mt-2 text-6xl text-foreground sm:text-7xl"
          i18n="@@home.chaptersTitle"
        >
          Three cities, one story
        </h2>
        <p class="mt-3 text-lg text-muted-foreground" i18n="@@home.chaptersText">
          Start in the red city, cross the High Atlas to the kasbahs, end the night under the
          Saharan sky.
        </p>
      </div>
      <div class="space-y-24">
        @for (city of chapterCities(); track city.slug; let odd = $odd) {
          <trv-home-chapter [city]="city" [flip]="odd" />
        }
      </div>
    </section>

    <!-- Categories -->
    @if (categories.value(); as categoryList) {
      <section class="container-page mt-24" aria-labelledby="categories-title">
        <h2
          id="categories-title"
          class="text-5xl text-foreground sm:text-6xl"
          i18n="@@home.categoriesTitle"
        >
          What do you feel like?
        </h2>
        <div class="mt-6 flex flex-wrap gap-3">
          @for (category of categoryList; track category.slug) {
            <a
              [routerLink]="['/activities']"
              [queryParams]="{ category: category.slug }"
              class="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-border bg-card px-5 font-semibold text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
            >
              <trv-icon [name]="category.icon ?? 'dune'" class="size-5" />
              {{ category.name }}
            </a>
          }
        </div>
      </section>
    }

    <!-- Closing call to action -->
    <section class="container-page mt-24">
      <div
        class="aurora relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center text-white sm:px-12 sm:py-24"
      >
        <div class="absolute inset-0 -z-10 bg-[#082f49]/55"></div>
        <h2 class="text-balance mx-auto max-w-3xl text-6xl sm:text-8xl" i18n="@@home.ctaTitle">
          Your Moroccan story starts here
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-white/90" i18n="@@home.ctaText">
          No payment online. Send a request, we confirm with the guide, you pay on the day.
        </p>
        <a routerLink="/activities" class="btn-accent mt-8 px-8 text-base">
          <ng-container i18n="@@home.ctaButton">Browse all activities</ng-container>
          <trv-icon name="arrow-right" class="size-5" />
        </a>
      </div>
    </section>
  `,
})
export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly cities = httpResource<City[]>(() => catalogApi.cities());
  protected readonly categories = httpResource<Category[]>(() => catalogApi.categories());

  /** Launch cities in story order (Marrakech, Ouarzazate, Merzouga), then any city added later. */
  protected readonly chapterCities = computed(() => {
    const order = (slug: string) => {
      const index = CHAPTER_ORDER.indexOf(slug);
      return index === -1 ? CHAPTER_ORDER.length : index;
    };
    return [...(this.cities.value() ?? [])].sort((a, b) => order(a.slug) - order(b.slug));
  });

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
