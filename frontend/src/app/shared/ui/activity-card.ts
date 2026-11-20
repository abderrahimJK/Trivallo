import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivitySummary } from '../../core/api/catalog.models';
import { DurationPipe } from '../pipes/duration.pipe';
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
      class="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
    >
      <trv-media-frame
        class="aspect-[4/3]"
        [src]="item.coverImageUrl"
        [alt]="item.title"
        [icon]="item.category.icon ?? 'dune'"
      />
      <div class="flex flex-1 flex-col gap-2 p-4">
        <p
          class="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-terracotta-600 uppercase"
        >
          <trv-icon name="map-pin" class="size-3.5" />
          {{ item.city.name }} · {{ item.category.name }}
        </p>
        <h3
          class="font-sans text-base leading-snug font-semibold text-ink-900 group-hover:text-teal-700"
        >
          {{ item.title }}
        </h3>
        @if (item.summary) {
          <p class="line-clamp-2 text-sm text-ink-500">{{ item.summary }}</p>
        }
        <div class="mt-auto flex items-end justify-between pt-3">
          <span class="flex items-center gap-1.5 text-sm text-ink-500">
            <trv-icon name="clock" class="size-4" />
            {{ item.durationMinutes | duration }}
          </span>
          <span class="text-right">
            <span class="block text-xs text-ink-500" i18n="@@activityCard.from">from</span>
            <span class="text-lg font-bold text-ink-900">{{
              item.priceAdultEur | currency: 'EUR'
            }}</span>
          </span>
        </div>
      </div>
    </a>
  `,
})
export class ActivityCard {
  readonly activity = input.required<ActivitySummary>();
}
