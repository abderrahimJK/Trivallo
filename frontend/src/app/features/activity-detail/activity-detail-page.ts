import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catalogApi } from '../../core/api/catalog-api';
import { ActivityDetail } from '../../core/api/catalog.models';
import { isNotFound } from '../../core/http/http-errors';
import { SeoService } from '../../core/seo/seo.service';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { WeekdaysPipe } from '../../shared/pipes/weekdays.pipe';
import { cityChapter } from '../../shared/ui/city-chapter';
import { Dunes } from '../../shared/ui/dunes';
import { Icon } from '../../shared/ui/icon';
import { MediaFrame } from '../../shared/ui/media-frame';
import { NotFoundView } from '../not-found/not-found-view';

@Component({
  selector: 'trv-activity-detail-page',
  imports: [
    RouterLink,
    CurrencyPipe,
    DurationPipe,
    WeekdaysPipe,
    Dunes,
    Icon,
    MediaFrame,
    NotFoundView,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activity.hasValue()) {
      @let item = activity.value();
      @let tone = chapter();
      <article>
        <!-- Header band in the city's chapter color -->
        <header
          class="relative isolate overflow-hidden bg-gradient-to-br text-white"
          [class]="tone.gradient"
        >
          <div class="container-page pt-6 pb-28 sm:pb-32">
            <nav class="text-sm" i18n-aria-label="@@detail.breadcrumb" aria-label="Breadcrumb">
              <ol class="flex flex-wrap items-center gap-x-2 text-white/85">
                <li>
                  <a
                    routerLink="/"
                    class="inline-flex min-h-11 items-center hover:text-white hover:underline"
                    i18n="@@detail.home"
                    >Home</a
                  >
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <a
                    [routerLink]="['/cities', item.city.slug]"
                    class="inline-flex min-h-11 items-center hover:text-white hover:underline"
                    >{{ item.city.name }}</a
                  >
                </li>
                <li aria-hidden="true">/</li>
                <li class="line-clamp-1 text-white" aria-current="page">{{ item.title }}</li>
              </ol>
            </nav>
            <p class="eyebrow mt-4 flex items-center gap-2 text-white/90">
              <trv-icon [name]="item.category.icon ?? 'dune'" class="size-4" />
              {{ item.category.name }}
            </p>
            <h1 class="text-balance animate-rise mt-2 max-w-4xl text-6xl sm:text-8xl">
              {{ item.title }}
            </h1>
            <ul class="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
              <li
                class="flex min-h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 backdrop-blur"
              >
                <trv-icon name="map-pin" class="size-4" />{{ item.city.name }}
              </li>
              <li
                class="flex min-h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 backdrop-blur"
              >
                <trv-icon name="clock" class="size-4" />{{ item.durationMinutes | duration }}
              </li>
              <li
                class="flex min-h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 backdrop-blur"
              >
                <trv-icon name="users" class="size-4" />
                <ng-container i18n="@@detail.maxGroup"
                  >Up to {{ item.maxGroupSize }} people</ng-container
                >
              </li>
              <li
                class="flex min-h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 backdrop-blur"
              >
                <trv-icon name="calendar" class="size-4" />{{
                  item.operatingDays | weekdays: everyDayLabel
                }}
              </li>
            </ul>
          </div>
          <trv-dunes class="absolute inset-x-0 bottom-0 h-14 text-background sm:h-20" />
        </header>

        <div class="container-page -mt-20 sm:-mt-24">
          <!-- Gallery: one large image, up to two smaller ones beside it from sm up -->
          <div class="grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
            <trv-media-frame
              class="aspect-[4/3] rounded-3xl shadow-xl sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-96"
              [src]="item.images[0]?.url ?? null"
              [alt]="item.images[0]?.altText ?? item.title"
              [icon]="item.category.icon ?? 'dune'"
              [city]="item.city.slug"
              sizes="(min-width: 640px) 66vw, 100vw"
              [priority]="true"
            />
            @for (image of item.images.slice(1, 3); track image.url) {
              <trv-media-frame
                class="hidden rounded-3xl shadow-md sm:block"
                [src]="image.url"
                [alt]="image.altText ?? item.title"
                [city]="item.city.slug"
                sizes="33vw"
              />
            }
          </div>

          <div class="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
            <div class="space-y-12">
              @if (item.summary) {
                <p class="border-l-4 border-accent pl-5 text-xl text-foreground">
                  {{ item.summary }}
                </p>
              }
              @if (item.description) {
                <section>
                  <h2 class="text-5xl text-foreground" i18n="@@detail.about">
                    About this experience
                  </h2>
                  <p class="mt-4 text-lg whitespace-pre-line text-foreground">
                    {{ item.description }}
                  </p>
                </section>
              }
              @if (item.itinerary) {
                <section>
                  <h2 class="text-5xl text-foreground" i18n="@@detail.itinerary">Itinerary</h2>
                  <p
                    class="mt-4 rounded-2xl bg-muted p-6 text-lg whitespace-pre-line text-foreground"
                  >
                    {{ item.itinerary }}
                  </p>
                </section>
              }
              @if (item.included.length || item.notIncluded.length) {
                <section class="grid gap-6 sm:grid-cols-2">
                  @if (item.included.length) {
                    <div class="rounded-2xl border border-border bg-card p-6">
                      <h2 class="text-4xl text-foreground" i18n="@@detail.included">Included</h2>
                      <ul class="mt-4 space-y-3">
                        @for (line of item.included; track line) {
                          <li class="flex gap-3 text-foreground">
                            <span
                              class="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-white"
                            >
                              <trv-icon name="check" class="size-4" />
                            </span>
                            {{ line }}
                          </li>
                        }
                      </ul>
                    </div>
                  }
                  @if (item.notIncluded.length) {
                    <div class="rounded-2xl border border-border bg-card p-6">
                      <h2 class="text-4xl text-foreground" i18n="@@detail.notIncluded">
                        Not included
                      </h2>
                      <ul class="mt-4 space-y-3">
                        @for (line of item.notIncluded; track line) {
                          <li class="flex gap-3 text-foreground">
                            <span
                              class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-destructive"
                            >
                              <trv-icon name="x" class="size-4" />
                            </span>
                            {{ line }}
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </section>
              }
              @if (item.meetingPoint) {
                <section>
                  <h2 class="text-5xl text-foreground" i18n="@@detail.meetingPoint">
                    Meeting point
                  </h2>
                  <div class="mt-4 flex items-start gap-3 text-lg text-foreground">
                    <trv-icon name="map-pin" class="mt-1 size-5 shrink-0" [class]="tone.text" />
                    <div>
                      <p>{{ item.meetingPoint }}</p>
                      @if (mapUrl(); as url) {
                        <a
                          [href]="url"
                          target="_blank"
                          rel="noopener"
                          class="inline-flex min-h-11 items-center gap-1.5 font-bold underline decoration-accent decoration-2 underline-offset-4"
                        >
                          <ng-container i18n="@@detail.openMap">Open in Maps</ng-container>
                          <trv-icon name="external" class="size-4" />
                        </a>
                      }
                    </div>
                  </div>
                </section>
              }
              @if (item.tripadvisorUrl) {
                <a [href]="item.tripadvisorUrl" target="_blank" rel="noopener" class="btn-ghost">
                  <ng-container i18n="@@detail.tripadvisor"
                    >Read reviews on TripAdvisor</ng-container
                  >
                  <trv-icon name="external" class="size-4" />
                </a>
              }
            </div>

            <!-- Price and booking card; sticky beside the content on large screens -->
            <aside class="hidden lg:sticky lg:top-20 lg:block lg:self-start">
              <div class="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
                <div class="aurora relative isolate px-6 py-5 text-white">
                  <div class="absolute inset-0 -z-10 bg-[#082f49]/60"></div>
                  <p class="eyebrow text-white/90" i18n="@@detail.priceFrom">From</p>
                  <p class="font-display text-7xl leading-none">
                    {{ item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0' }}
                  </p>
                  <p class="text-white/90" i18n="@@detail.perAdult">per adult</p>
                </div>
                <div class="p-6">
                  <p class="text-muted-foreground" i18n="@@detail.childPrice">
                    Children: {{ item.priceChildEur | currency: 'EUR' }}
                  </p>
                  <button
                    type="button"
                    class="btn-accent mt-5 w-full"
                    disabled
                    i18n="@@detail.requestBooking"
                  >
                    Request booking
                  </button>
                  <p
                    class="mt-3 text-center text-sm text-muted-foreground"
                    i18n="@@detail.bookingSoon"
                  >
                    Booking requests open very soon. No payment online: you pay on the day.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <!-- Phones and tablets: price and action stay reachable at the bottom of the screen -->
        <div
          class="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 shadow-xl backdrop-blur lg:hidden"
        >
          <div class="container-page flex items-center justify-between gap-4 py-3">
            <p>
              <span
                class="block text-xs font-bold tracking-widest text-muted-foreground uppercase"
                i18n="@@detail.priceFrom"
                >From</span
              >
              <span class="font-display text-4xl leading-none text-foreground">{{
                item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0'
              }}</span>
            </p>
            <button type="button" class="btn-accent" disabled i18n="@@detail.requestBooking">
              Request booking
            </button>
          </div>
        </div>
        <div class="h-20 lg:hidden" aria-hidden="true"></div>
      </article>
    } @else if (notFound()) {
      <trv-not-found-view />
    } @else if (activity.isLoading()) {
      <div class="h-80 animate-pulse bg-muted"></div>
      <div class="container-page -mt-20">
        <div class="aspect-[16/7] animate-pulse rounded-3xl bg-border"></div>
      </div>
    }
  `,
})
export class ActivityDetailPage {
  readonly slug = input.required<string>();

  private readonly seo = inject(SeoService);

  protected readonly everyDayLabel = $localize`:@@detail.everyDay:Every day`;

  protected readonly activity = httpResource<ActivityDetail>(() =>
    catalogApi.activity(this.slug()),
  );
  protected readonly notFound = computed(() => isNotFound(this.activity.error()));
  protected readonly chapter = computed(() => cityChapter(this.activity.value()?.city.slug));

  protected readonly mapUrl = computed(() => {
    const item = this.activity.value();
    return item?.latitude != null && item.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`
      : null;
  });

  constructor() {
    effect(() => {
      if (this.activity.hasValue()) {
        const item = this.activity.value();
        this.seo.update({
          title: item.metaTitle ?? item.title,
          description: item.metaDescription ?? item.summary,
          imageUrl: item.images[0]?.url,
        });
      }
    });
  }
}
