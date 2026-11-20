import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catalogApi, toActivityParams } from '../../core/api/catalog-api';
import { ActivitySummary, City, Page } from '../../core/api/catalog.models';
import { ActivityCard } from '../../shared/ui/activity-card';
import { CardSkeleton } from '../../shared/ui/card-skeleton';
import { cityChapter } from '../../shared/ui/city-chapter';
import { Icon } from '../../shared/ui/icon';

const ACTIVITIES_PER_CHAPTER = 3;

/** One city as a chapter of the home page story: a colored band, then its top activities overlapping it. */
@Component({
  selector: 'trv-home-chapter',
  imports: [RouterLink, ActivityCard, CardSkeleton, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let item = city();
    <section [attr.aria-labelledby]="'chapter-' + item.slug">
      <div class="bg-gradient-to-br text-white" [class]="chapter().gradient">
        <div
          class="container-page flex flex-col gap-2 pt-14 pb-36 sm:pb-40 lg:flex-row lg:items-end lg:gap-12"
          [class]="flip() ? 'lg:flex-row-reverse lg:text-right' : ''"
        >
          <p
            class="font-display text-[7rem] leading-[0.8] text-white/25 sm:text-[11rem]"
            aria-hidden="true"
          >
            {{ chapter().number }}
          </p>
          <div class="max-w-3xl">
            <p class="eyebrow text-white/85">
              <ng-container i18n="@@chapter.label">Chapter {{ chapter().number }}</ng-container>
            </p>
            <h2 [id]="'chapter-' + item.slug" class="mt-2 text-7xl sm:text-8xl">
              {{ item.name }}
            </h2>
            @if (item.description) {
              <p class="mt-3 text-lg text-white/90">{{ item.description }}</p>
            }
            <a
              [routerLink]="['/cities', item.slug]"
              class="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold tracking-wide uppercase shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              [class]="chapter().text"
            >
              <ng-container i18n="@@chapter.explore">Explore {{ item.name }}</ng-container>
              <trv-icon name="arrow-right" class="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div class="container-page -mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @if (activities.hasValue()) {
          @for (activity of activities.value().content; track activity.slug; let index = $index) {
            <!-- Two columns on tablets: the third card would sit alone, so it shows from lg up -->
            <trv-activity-card
              [class]="index === 2 ? 'animate-rise sm:max-lg:hidden' : 'animate-rise'"
              [style.animation-delay.ms]="index * 80"
              [activity]="activity"
            />
          }
        } @else if (activities.isLoading()) {
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <trv-card-skeleton />
          }
        }
      </div>
    </section>
  `,
})
export class HomeChapter {
  readonly city = input.required<City>();
  /** Alternates the band layout on large screens so the story does not read as a repeated block. */
  readonly flip = input(false);

  protected readonly chapter = computed(() => cityChapter(this.city().slug));

  protected readonly activities = httpResource<Page<ActivitySummary>>(() => ({
    url: catalogApi.activities(),
    params: toActivityParams({ city: this.city().slug, size: ACTIVITIES_PER_CHAPTER }),
  }));
}
