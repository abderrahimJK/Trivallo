import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivitySummary } from '../../core/api/catalog.models';
import { DurationPipe } from '../pipes/duration.pipe';
import { cityChapter } from './city-chapter';
import { Icon } from './icon';
import { MediaFrame } from './media-frame';

@Component({
  selector: 'trv-activity-card',
  imports: [RouterLink, CurrencyPipe, DurationPipe, Icon, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let item = activity();
    <a
      [routerLink]="['/activities', item.slug]"
      class="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div class="relative">
        <trv-media-frame
          class="aspect-[4/3]"
          [src]="item.coverImageUrl"
          [alt]="item.title"
          [icon]="item.category.icon ?? 'dune'"
          [city]="item.city.slug"
        />
        <span
          class="absolute bottom-3 left-3 rounded-full bg-accent px-3 py-1 text-sm font-bold text-on-accent shadow-md"
        >
          <ng-container i18n="@@activityCard.from">from</ng-container>
          {{ item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0' }}
        </span>
      </div>
      <div class="flex flex-1 flex-col gap-2 p-5">
        <p class="eyebrow flex items-center gap-1.5" [class]="chapter().text">
          <trv-icon name="map-pin" class="size-3.5" />
          {{ item.city.name }} · {{ item.category.name }}
        </p>
        <h3 class="text-lg leading-snug font-bold text-card-foreground">{{ item.title }}</h3>
        @if (item.summary) {
          <p class="line-clamp-2 text-sm text-muted-foreground">{{ item.summary }}</p>
        }
        <div
          class="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground"
        >
          <span class="flex items-center gap-1.5">
            <trv-icon name="clock" class="size-4" />
            {{ item.durationMinutes | duration }}
          </span>
          <trv-icon
            name="arrow-right"
            class="size-5 text-foreground transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </a>
  `,
})
export class ActivityCard {
  readonly activity = input.required<ActivitySummary>();

  protected readonly chapter = computed(() => cityChapter(this.activity().city.slug));
}
