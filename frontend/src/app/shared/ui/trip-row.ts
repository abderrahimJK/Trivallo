import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivitySummary } from '../../core/api/catalog.models';
import { ActivityTypeLabelPipe } from '../pipes/activity-type-label.pipe';
import { DurationPipe } from '../pipes/duration.pipe';
import { Icon } from './icon';
import { MediaFrame } from './media-frame';

/**
 * Trip as a row in a destination list: photo, key facts, tags, and a price column.
 * Stacks on phones, sits side by side from sm up. The whole card is one link.
 */
@Component({
  selector: 'trv-trip-row',
  imports: [RouterLink, CurrencyPipe, DurationPipe, ActivityTypeLabelPipe, Icon, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let item = activity();
    <a
      [routerLink]="['/activities', item.slug]"
      class="group grid overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:shadow-lg sm:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr_200px]"
    >
      <trv-media-frame
        class="aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-48"
        [src]="item.coverImageUrl"
        [alt]="item.title"
        [icon]="item.category.icon ?? 'dune'"
        [city]="item.city.slug"
        sizes="(min-width: 640px) 280px, 100vw"
      />

      <div class="p-5">
        <h3
          class="text-xl leading-snug font-bold decoration-2 underline-offset-4 group-hover:underline"
        >
          {{ item.title }}
        </h3>
        <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <li class="flex items-center gap-1.5">
            <trv-icon name="clock" class="size-4" />{{ item.durationMinutes | duration }}
          </li>
          <li class="flex items-center gap-1.5">
            <trv-icon name="map-pin" class="size-4" />{{ item.city.name }}
          </li>
        </ul>
        @if (item.summary) {
          <p class="mt-3 line-clamp-2 text-muted-foreground">{{ item.summary }}</p>
        }
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span class="tag">{{ item.type | activityTypeLabel }}</span>
          <span class="tag">{{ item.category.name }}</span>
        </div>
      </div>

      <!-- Price column: below the facts on tablets, its own column on desktop -->
      <div
        class="flex items-center justify-between gap-4 border-t border-border p-5 sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-stretch lg:justify-center lg:border-t-0 lg:border-l"
      >
        <p>
          <span class="block text-sm text-muted-foreground" i18n="@@tripRow.from">From</span>
          <span class="text-2xl font-extrabold">{{
            item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0'
          }}</span>
          <span class="block text-sm text-muted-foreground" i18n="@@tripRow.perAdult"
            >per adult</span
          >
        </p>
        <span class="btn-outline group-hover:border-foreground lg:w-full" aria-hidden="true">
          <ng-container i18n="@@tripRow.view">View trip</ng-container>
        </span>
      </div>
    </a>
  `,
})
export class TripRow {
  readonly activity = input.required<ActivitySummary>();
}
