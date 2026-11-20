import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { City } from '../../core/api/catalog.models';
import { Icon } from './icon';
import { MediaFrame } from './media-frame';

@Component({
  selector: 'trv-city-card',
  imports: [RouterLink, Icon, MediaFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let item = city();
    <a
      [routerLink]="['/cities', item.slug]"
      class="group relative block aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)] sm:aspect-[3/4]"
    >
      <trv-media-frame
        class="absolute inset-0"
        [src]="item.heroImageUrl"
        [alt]="item.name"
        icon="kasbah"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent"
      ></div>
      <div class="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 class="text-2xl">{{ item.name }}</h3>
        @if (item.description) {
          <p class="mt-1 line-clamp-2 text-sm text-white/85">{{ item.description }}</p>
        }
        <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
          <ng-container i18n="@@cityCard.explore">Explore</ng-container>
          <trv-icon name="arrow-right" class="size-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  `,
})
export class CityCard {
  readonly city = input.required<City>();
}
