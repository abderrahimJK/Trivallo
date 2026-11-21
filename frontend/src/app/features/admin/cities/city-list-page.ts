import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { sizedImageUrl } from '../../../core/media/image-sizes';
import { adminApi } from '../api/admin-api';
import { CityAdmin, englishName } from '../api/admin.models';
import { AdminPageHeader } from '../ui/page-header';

@Component({
  selector: 'trv-city-list-page',
  imports: [RouterLink, AdminPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <trv-admin-page-header title="Cities">
      <a routerLink="/admin/cities/new" class="btn-cta">New city</a>
    </trv-admin-page-header>

    @if (cities.error()) {
      <p role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
        Cities could not be loaded.
        <button type="button" class="link" (click)="cities.reload()">Try again</button>
      </p>
    } @else {
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (city of cities.value() ?? []; track city.id) {
          <li>
            <a
              [routerLink]="['/admin/cities', city.id]"
              class="block overflow-hidden rounded-xl border border-border bg-background hover:border-foreground/40"
            >
              @if (city.heroImageUrl) {
                <img
                  [src]="medium(city.heroImageUrl)"
                  alt=""
                  class="aspect-[16/9] w-full object-cover"
                />
              } @else {
                <div
                  class="grid aspect-[16/9] place-items-center bg-muted text-sm text-muted-foreground"
                >
                  No hero photo
                </div>
              }
              <div class="p-4">
                <p class="font-bold">{{ name(city) }}</p>
                <p class="text-sm text-muted-foreground">
                  /{{ city.slug }} · order {{ city.sortOrder }}
                  @if (!hasFrench(city)) {
                    · <span class="text-amber-800">French missing</span>
                  }
                </p>
              </div>
            </a>
          </li>
        } @empty {
          @if (!cities.isLoading()) {
            <li class="text-muted-foreground">No cities yet.</li>
          }
        }
      </ul>
    }
  `,
})
export class CityListPage {
  protected readonly cities = httpResource<CityAdmin[]>(() => adminApi.cities());
  protected readonly name = englishName;
  protected readonly medium = (url: string) => sizedImageUrl(url, 'md');
  protected hasFrench(city: CityAdmin): boolean {
    return city.translations.some((t) => t.locale === 'fr');
  }
}
