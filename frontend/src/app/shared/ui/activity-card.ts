import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivitySummary } from '../../core/api/catalog.models';
import { DurationPipe } from '../pipes/duration.pipe';
import { ActivityTypeLabelPipe } from '../pipes/activity-type-label.pipe';
import { MediaFrame } from './media-frame';

/** Compact trip card for grids (home page): photo, key facts, price. */
@Component({
  selector: 'trv-activity-card',
  imports: [RouterLink, CurrencyPipe, DurationPipe, ActivityTypeLabelPipe, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let item = activity();
    <a [routerLink]="['/activities', item.slug]" class="group flex h-full flex-col">
      <trv-media-frame
        class="aspect-[4/3] rounded-xl"
        [src]="item.coverImageUrl"
        [alt]="item.title"
        [icon]="item.category.icon ?? 'dune'"
        [city]="item.city.slug"
      />
      <div class="flex flex-1 flex-col pt-4">
        <div class="flex flex-wrap gap-1.5">
          <span class="tag">{{ item.type | activityTypeLabel }}</span>
          <span class="tag">{{ item.category.name }}</span>
        </div>
        <h3
          class="mt-2 text-lg leading-snug font-bold decoration-2 underline-offset-4 group-hover:underline"
        >
          {{ item.title }}
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ item.durationMinutes | duration }} · {{ item.city.name }}
        </p>
        <p class="mt-auto pt-3 text-sm text-muted-foreground">
          <ng-container i18n="@@activityCard.from">From</ng-container>
          <span class="ml-1 text-lg font-extrabold text-foreground">{{
            item.priceAdultEur | currency: 'EUR' : 'symbol' : '1.0-0'
          }}</span>
        </p>
      </div>
    </a>
  `,
})
export class ActivityCard {
  readonly activity = input.required<ActivitySummary>();
}
