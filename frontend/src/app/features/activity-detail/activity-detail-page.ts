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
import { Icon } from '../../shared/ui/icon';
import { MediaFrame } from '../../shared/ui/media-frame';
import { NotFoundView } from '../not-found/not-found-view';

@Component({
  selector: 'trv-activity-detail-page',
  imports: [RouterLink, CurrencyPipe, DurationPipe, WeekdaysPipe, Icon, MediaFrame, NotFoundView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activity.hasValue()) {
      @let item = activity.value();
      <article class="container-page pt-6">
        <nav
          class="text-sm text-ink-500"
          i18n-aria-label="@@detail.breadcrumb"
          aria-label="Breadcrumb"
        >
          <ol class="flex flex-wrap items-center gap-1.5">
            <li><a routerLink="/" class="hover:text-ink-900" i18n="@@detail.home">Home</a></li>
            <li aria-hidden="true">/</li>
            <li>
              <a [routerLink]="['/cities', item.city.slug]" class="hover:text-ink-900">{{
                item.city.name
              }}</a>
            </li>
            <li aria-hidden="true">/</li>
            <li class="text-ink-700" aria-current="page">{{ item.title }}</li>
          </ol>
        </nav>

        <header class="mt-4">
          <p class="text-xs font-semibold tracking-wide text-terracotta-600 uppercase">
            {{ item.category.name }}
          </p>
          <h1 class="mt-1 text-3xl leading-tight sm:text-4xl">{{ item.title }}</h1>
          <ul class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
            <li class="flex items-center gap-1.5">
              <trv-icon name="map-pin" class="size-4" />{{ item.city.name }}
            </li>
            <li class="flex items-center gap-1.5">
              <trv-icon name="clock" class="size-4" />{{ item.durationMinutes | duration }}
            </li>
            <li class="flex items-center gap-1.5">
              <trv-icon name="users" class="size-4" />
              <ng-container i18n="@@detail.maxGroup"
                >Up to {{ item.maxGroupSize }} people</ng-container
              >
            </li>
            <li class="flex items-center gap-1.5">
              <trv-icon name="calendar" class="size-4" />{{
                item.operatingDays | weekdays: everyDayLabel
              }}
            </li>
          </ul>
        </header>

        <!-- Gallery: one large image, up to two smaller ones beside it from sm up -->
        <div class="mt-6 grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
          <trv-media-frame
            class="aspect-[4/3] rounded-[var(--radius-card)] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-96"
            [src]="item.images[0]?.url ?? null"
            [alt]="item.images[0]?.altText ?? item.title"
            [icon]="item.category.icon ?? 'dune'"
            [eager]="true"
          />
          @for (image of item.images.slice(1, 3); track image.url) {
            <trv-media-frame
              class="hidden rounded-[var(--radius-card)] sm:block"
              [src]="image.url"
              [alt]="image.altText ?? item.title"
            />
          }
        </div>

        <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div class="space-y-10">
            @if (item.summary) {
              <p class="text-lg text-ink-700">{{ item.summary }}</p>
            }
            @if (item.description) {
              <section>
                <h2 class="text-2xl" i18n="@@detail.about">About this experience</h2>
                <p class="mt-3 whitespace-pre-line text-ink-700">{{ item.description }}</p>
              </section>
            }
            @if (item.itinerary) {
              <section>
                <h2 class="text-2xl" i18n="@@detail.itinerary">Itinerary</h2>
                <p class="mt-3 whitespace-pre-line text-ink-700">{{ item.itinerary }}</p>
              </section>
            }
            @if (item.included.length || item.notIncluded.length) {
              <section class="grid gap-6 sm:grid-cols-2">
                @if (item.included.length) {
                  <div>
                    <h2 class="text-2xl" i18n="@@detail.included">Included</h2>
                    <ul class="mt-3 space-y-2">
                      @for (line of item.included; track line) {
                        <li class="flex gap-2 text-ink-700">
                          <trv-icon name="check" class="mt-0.5 size-5 text-teal-600" />{{ line }}
                        </li>
                      }
                    </ul>
                  </div>
                }
                @if (item.notIncluded.length) {
                  <div>
                    <h2 class="text-2xl" i18n="@@detail.notIncluded">Not included</h2>
                    <ul class="mt-3 space-y-2">
                      @for (line of item.notIncluded; track line) {
                        <li class="flex gap-2 text-ink-700">
                          <trv-icon name="x" class="mt-0.5 size-5 text-terracotta-500" />{{ line }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </section>
            }
            @if (item.meetingPoint) {
              <section>
                <h2 class="text-2xl" i18n="@@detail.meetingPoint">Meeting point</h2>
                <p class="mt-3 flex items-start gap-2 text-ink-700">
                  <trv-icon name="map-pin" class="mt-0.5 size-5 text-terracotta-500" />
                  <span>
                    {{ item.meetingPoint }}
                    @if (mapUrl(); as url) {
                      <a
                        [href]="url"
                        target="_blank"
                        rel="noopener"
                        class="ml-1 inline-flex items-center gap-1 font-semibold text-teal-700"
                      >
                        <ng-container i18n="@@detail.openMap">Open in Maps</ng-container>
                        <trv-icon name="external" class="size-3.5" />
                      </a>
                    }
                  </span>
                </p>
              </section>
            }
            @if (item.tripadvisorUrl) {
              <a [href]="item.tripadvisorUrl" target="_blank" rel="noopener" class="btn-secondary">
                <ng-container i18n="@@detail.tripadvisor">Read reviews on TripAdvisor</ng-container>
                <trv-icon name="external" class="size-4" />
              </a>
            }
          </div>

          <!-- Price and booking card; sticky beside the content on large screens -->
          <aside class="lg:sticky lg:top-24 lg:self-start">
            <div class="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
              <p class="text-sm text-ink-500" i18n="@@detail.priceFrom">From</p>
              <p class="text-3xl font-bold">
                {{ item.priceAdultEur | currency: 'EUR' }}
                <span class="text-base font-normal text-ink-500" i18n="@@detail.perAdult"
                  >per adult</span
                >
              </p>
              <p class="mt-1 text-sm text-ink-500" i18n="@@detail.childPrice">
                Children: {{ item.priceChildEur | currency: 'EUR' }}
              </p>
              <button
                type="button"
                class="btn-primary mt-6 w-full"
                disabled
                i18n="@@detail.requestBooking"
              >
                Request booking
              </button>
              <p class="mt-3 text-center text-xs text-ink-500" i18n="@@detail.bookingSoon">
                Booking requests open very soon. No payment online: you pay on the day.
              </p>
            </div>
          </aside>
        </div>

        <!-- Phones and tablets: price and action stay reachable at the bottom of the screen -->
        <div
          class="fixed inset-x-0 bottom-0 z-20 border-t border-sand-200 bg-white/95 backdrop-blur lg:hidden"
        >
          <div class="container-page flex items-center justify-between gap-4 py-3">
            <p>
              <span class="block text-xs text-ink-500" i18n="@@detail.priceFrom">From</span>
              <span class="text-xl font-bold">{{ item.priceAdultEur | currency: 'EUR' }}</span>
            </p>
            <button type="button" class="btn-primary" disabled i18n="@@detail.requestBooking">
              Request booking
            </button>
          </div>
        </div>
        <div class="h-20 lg:hidden" aria-hidden="true"></div>
      </article>
    } @else if (notFound()) {
      <trv-not-found-view />
    } @else if (activity.isLoading()) {
      <div class="container-page animate-pulse pt-10">
        <div class="h-8 w-2/3 rounded bg-sand-200"></div>
        <div class="mt-6 aspect-[16/7] rounded-[var(--radius-card)] bg-sand-100"></div>
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
