import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { catalogApi } from '../../core/api/catalog-api';
import { ActivityDetail } from '../../core/api/catalog.models';
import { isNotFound } from '../../core/http/http-errors';
import { SeoService } from '../../core/seo/seo.service';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { WeekdaysPipe } from '../../shared/pipes/weekdays.pipe';
import { ActivityTypeLabelPipe } from '../../shared/pipes/activity-type-label.pipe';
import { Breadcrumb } from '../../shared/ui/breadcrumb';
import { Icon } from '../../shared/ui/icon';
import { MediaFrame } from '../../shared/ui/media-frame';
import { NotFoundView } from '../not-found/not-found-view';

@Component({
  selector: 'trv-activity-detail-page',
  imports: [
    CurrencyPipe,
    DurationPipe,
    WeekdaysPipe,
    ActivityTypeLabelPipe,
    Breadcrumb,
    Icon,
    MediaFrame,
    NotFoundView,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activity.hasValue()) {
      @let item = activity.value();
      <article class="container-page pt-2">
        <trv-breadcrumb
          [crumbs]="[
            { label: item.city.name, link: ['/cities', item.city.slug] },
            { label: item.title },
          ]"
        />

        <header class="mt-2">
          <div class="flex flex-wrap gap-1.5">
            <span class="tag">{{ item.type | activityTypeLabel }}</span>
            <span class="tag">{{ item.category.name }}</span>
          </div>
          <h1 class="mt-3 max-w-4xl text-3xl sm:text-5xl">{{ item.title }}</h1>
          @if (item.summary) {
            <p class="mt-3 max-w-3xl text-lg text-muted-foreground">{{ item.summary }}</p>
          }
        </header>

        <!-- Gallery: one large image, up to two smaller ones beside it from sm up -->
        <div class="mt-6 grid gap-3 sm:grid-cols-3 sm:grid-rows-2">
          <trv-media-frame
            class="aspect-[4/3] rounded-2xl sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[26rem]"
            [src]="item.images[0]?.url ?? null"
            [alt]="item.images[0]?.altText ?? item.title"
            [icon]="item.category.icon ?? 'dune'"
            [city]="item.city.slug"
            sizes="(min-width: 640px) 66vw, 100vw"
            [priority]="true"
          />
          @for (image of item.images.slice(1, 3); track image.url) {
            <trv-media-frame
              class="hidden rounded-2xl sm:block"
              [src]="image.url"
              [alt]="image.altText ?? item.title"
              [city]="item.city.slug"
              sizes="33vw"
            />
          }
        </div>

        <!-- Key facts strip -->
        <dl
          class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4"
        >
          <div class="bg-card p-4">
            <dt class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <trv-icon name="clock" class="size-4" /><ng-container i18n="@@detail.factDuration"
                >Duration</ng-container
              >
            </dt>
            <dd class="mt-1 font-bold">{{ item.durationMinutes | duration }}</dd>
          </div>
          <div class="bg-card p-4">
            <dt class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <trv-icon name="map-pin" class="size-4" /><ng-container i18n="@@detail.factStart"
                >Starts in</ng-container
              >
            </dt>
            <dd class="mt-1 font-bold">{{ item.city.name }}</dd>
          </div>
          <div class="bg-card p-4">
            <dt class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <trv-icon name="users" class="size-4" /><ng-container i18n="@@detail.factGroup"
                >Group size</ng-container
              >
            </dt>
            <dd class="mt-1 font-bold" i18n="@@detail.maxGroup">
              Up to {{ item.maxGroupSize }} people
            </dd>
          </div>
          <div class="bg-card p-4">
            <dt class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <trv-icon name="calendar" class="size-4" /><ng-container i18n="@@detail.factDays"
                >Runs on</ng-container
              >
            </dt>
            <dd class="mt-1 font-bold">{{ item.operatingDays | weekdays: everyDayLabel }}</dd>
          </div>
        </dl>

        <div class="mt-12 grid gap-12 lg:grid-cols-[1fr_340px]">
          <div class="space-y-12">
            @if (item.description) {
              <section>
                <h2 class="section-title" i18n="@@detail.about">About this experience</h2>
                <p class="mt-4 text-lg whitespace-pre-line">{{ item.description }}</p>
              </section>
            }
            @if (item.itinerary) {
              <section>
                <h2 class="section-title" i18n="@@detail.itinerary">Itinerary</h2>
                <p class="mt-4 border-l-2 border-primary pl-5 text-lg whitespace-pre-line">
                  {{ item.itinerary }}
                </p>
              </section>
            }
            @if (item.included.length || item.notIncluded.length) {
              <section class="grid gap-8 sm:grid-cols-2">
                @if (item.included.length) {
                  <div>
                    <h2 class="text-xl" i18n="@@detail.included">Included</h2>
                    <ul class="mt-4 space-y-3">
                      @for (line of item.included; track line) {
                        <li class="flex gap-3">
                          <trv-icon name="check" class="mt-0.5 size-5 text-primary" />{{ line }}
                        </li>
                      }
                    </ul>
                  </div>
                }
                @if (item.notIncluded.length) {
                  <div>
                    <h2 class="text-xl" i18n="@@detail.notIncluded">Not included</h2>
                    <ul class="mt-4 space-y-3">
                      @for (line of item.notIncluded; track line) {
                        <li class="flex gap-3">
                          <trv-icon name="x" class="mt-0.5 size-5 text-muted-foreground" />{{
                            line
                          }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </section>
            }
            @if (item.meetingPoint) {
              <section>
                <h2 class="section-title" i18n="@@detail.meetingPoint">Meeting point</h2>
                <p class="mt-4 text-lg">{{ item.meetingPoint }}</p>
                @if (mapUrl(); as url) {
                  <a
                    [href]="url"
                    target="_blank"
                    rel="noopener"
                    class="link mt-1 inline-flex min-h-11 items-center gap-1.5"
                  >
                    <ng-container i18n="@@detail.openMap">Open in Maps</ng-container>
                    <trv-icon name="external" class="size-4" />
                  </a>
                }
              </section>
            }
            @if (item.tripadvisorUrl) {
              <a [href]="item.tripadvisorUrl" target="_blank" rel="noopener" class="btn-outline">
                <ng-container i18n="@@detail.tripadvisor">Read reviews on TripAdvisor</ng-container>
                <trv-icon name="external" class="size-4" />
              </a>
            }
          </div>

          <!-- Price box; sticky beside the content on large screens -->
          <aside class="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div class="rounded-xl border border-border p-6 shadow-lg">
              <p class="text-sm text-muted-foreground" i18n="@@detail.priceFrom">From</p>
              <p class="text-4xl font-extrabold">
                {{ item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0' }}
              </p>
              <p class="text-muted-foreground" i18n="@@detail.perAdult">per adult</p>
              <p
                class="mt-3 border-t border-border pt-3 text-muted-foreground"
                i18n="@@detail.childPrice"
              >
                Children: {{ item.priceChildEur | currency: 'EUR' }}
              </p>
              <button
                type="button"
                class="btn-cta mt-5 w-full"
                disabled
                i18n="@@detail.requestBooking"
              >
                Request booking
              </button>
              <p class="mt-3 text-sm text-muted-foreground" i18n="@@detail.bookingSoon">
                Booking requests open very soon. No payment online: you pay on the day.
              </p>
            </div>
          </aside>
        </div>

        <!-- Phones and tablets: price and action stay reachable at the bottom of the screen -->
        <div
          class="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        >
          <div class="container-page flex items-center justify-between gap-4 py-3">
            <p>
              <span class="block text-sm text-muted-foreground" i18n="@@detail.priceFrom"
                >From</span
              >
              <span class="text-2xl font-extrabold">{{
                item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0'
              }}</span>
            </p>
            <button type="button" class="btn-cta" disabled i18n="@@detail.requestBooking">
              Request booking
            </button>
          </div>
        </div>
        <div class="h-20 lg:hidden" aria-hidden="true"></div>
      </article>
    } @else if (notFound()) {
      <trv-not-found-view />
    } @else if (activity.isLoading()) {
      <div class="container-page pt-6">
        <div class="h-10 w-2/3 animate-pulse rounded bg-muted"></div>
        <div class="mt-6 aspect-[16/7] animate-pulse rounded-2xl bg-muted"></div>
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
