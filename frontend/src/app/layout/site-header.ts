import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { catalogApi } from '../core/api/catalog-api';
import { Category, City } from '../core/api/catalog.models';
import { CITY_ORDER } from '../shared/ui/city-chapter';
import { Icon } from '../shared/ui/icon';
import { LanguageSwitcher } from './language-switcher';

type MenuId = 'destinations' | 'ways';

/**
 * Global header with two menus, filled from the API so new cities and categories appear
 * without a code change: Destinations (cities) and Ways to travel (trip types and categories).
 * Desktop: panels open on click (hover-open fights with click-to-toggle), close on Escape,
 * outside click or navigation. Phones: one collapsible section per menu.
 */
@Component({
  selector: 'trv-site-header',
  imports: [RouterLink, LanguageSwitcher, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(document:keydown.escape)': 'openMenu.set(null)',
  },
  template: `
    <header class="sticky top-0 z-30 border-b border-border bg-background">
      <div class="container-page flex h-16 items-center justify-between gap-4">
        <a
          routerLink="/"
          class="flex min-h-11 items-center gap-2 text-xl font-extrabold tracking-tight"
        >
          <span
            class="flex size-8 items-center justify-center rounded-lg bg-primary text-on-primary"
            aria-hidden="true"
          >
            <trv-icon name="dune" class="size-5" />
          </span>
          Trivallo
        </a>

        <nav
          class="hidden flex-1 items-center gap-1 pl-6 md:flex"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          @for (menu of menus; track menu.id) {
            <button
              type="button"
              class="flex min-h-11 items-center gap-1 rounded-lg px-3 font-semibold transition-colors duration-200 hover:bg-muted"
              [class.bg-muted]="openMenu() === menu.id"
              [attr.aria-expanded]="openMenu() === menu.id"
              [attr.aria-controls]="'menu-' + menu.id"
              (click)="toggle(menu.id)"
            >
              {{ menu.label }}
              <trv-icon
                name="chevron-down"
                class="size-4 transition-transform duration-200"
                [class.rotate-180]="openMenu() === menu.id"
              />
            </button>
          }
          <a
            routerLink="/activities"
            class="flex min-h-11 items-center rounded-lg px-3 font-semibold transition-colors duration-200 hover:bg-muted"
            i18n="@@header.allTrips"
            >All trips</a
          >
        </nav>

        <div class="flex items-center gap-1">
          <trv-language-switcher />
          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted md:hidden"
            [attr.aria-expanded]="mobileOpen()"
            aria-controls="mobile-menu"
            (click)="mobileOpen.update((open) => !open)"
          >
            <span class="sr-only" i18n="@@header.menu">Menu</span>
            <trv-icon [name]="mobileOpen() ? 'x' : 'menu'" class="size-6" />
          </button>
        </div>
      </div>

      <!-- Desktop menu panels -->
      @if (openMenu() === 'destinations') {
        <div
          id="menu-destinations"
          class="absolute inset-x-0 top-full hidden border-t border-border bg-background shadow-xl md:block"
        >
          <div class="container-page grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
            <div>
              <p class="text-lg font-bold" i18n="@@header.morocco">Morocco</p>
              <a routerLink="/activities" class="link mt-2 inline-flex min-h-11 items-center gap-1">
                <ng-container i18n="@@header.allDestinations">All trips in Morocco</ng-container>
                <trv-icon name="arrow-right" class="size-4" />
              </a>
            </div>
            <ul class="grid gap-x-8 gap-y-2 sm:grid-cols-3">
              @for (city of cities(); track city.slug) {
                <li>
                  <a
                    [routerLink]="['/cities', city.slug]"
                    class="group block rounded-lg p-3 transition-colors duration-200 hover:bg-muted"
                  >
                    <span class="font-semibold group-hover:underline">{{ city.name }}</span>
                    @if (city.description) {
                      <span class="mt-1 line-clamp-2 block text-sm text-muted-foreground">{{
                        city.description
                      }}</span>
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
        </div>
      }
      @if (openMenu() === 'ways') {
        <div
          id="menu-ways"
          class="absolute inset-x-0 top-full hidden border-t border-border bg-background shadow-xl md:block"
        >
          <div class="container-page grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
            <div>
              <p class="text-lg font-bold" i18n="@@header.tripType">Trip type</p>
              <ul class="mt-2">
                @for (type of types; track type.value) {
                  <li>
                    <a
                      routerLink="/activities"
                      [queryParams]="{ type: type.value }"
                      class="link inline-flex min-h-11 items-center"
                      >{{ type.label }}</a
                    >
                  </li>
                }
              </ul>
            </div>
            <div>
              <p class="text-lg font-bold" i18n="@@header.experiences">Experiences</p>
              <ul class="mt-2 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                @for (category of categories.value() ?? []; track category.slug) {
                  <li>
                    <a
                      routerLink="/activities"
                      [queryParams]="{ category: category.slug }"
                      class="flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold transition-colors duration-200 hover:bg-muted"
                    >
                      <trv-icon
                        [name]="category.icon ?? 'dune'"
                        class="size-5 text-muted-foreground"
                      />
                      {{ category.name }}
                    </a>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      }

      <!-- Phones: collapsible sections -->
      @if (mobileOpen()) {
        <nav
          id="mobile-menu"
          class="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border md:hidden"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          <div class="container-page py-2">
            <details class="border-b border-border">
              <summary
                class="flex min-h-12 list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden"
              >
                {{ menus[0].label }}<trv-icon name="chevron-down" class="size-5" />
              </summary>
              <ul class="pb-3">
                @for (city of cities(); track city.slug) {
                  <li>
                    <a
                      [routerLink]="['/cities', city.slug]"
                      class="flex min-h-11 items-center pl-3"
                      >{{ city.name }}</a
                    >
                  </li>
                }
              </ul>
            </details>
            <details class="border-b border-border">
              <summary
                class="flex min-h-12 list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden"
              >
                {{ menus[1].label }}<trv-icon name="chevron-down" class="size-5" />
              </summary>
              <ul class="pb-3">
                @for (type of types; track type.value) {
                  <li>
                    <a
                      routerLink="/activities"
                      [queryParams]="{ type: type.value }"
                      class="flex min-h-11 items-center pl-3"
                      >{{ type.label }}</a
                    >
                  </li>
                }
                @for (category of categories.value() ?? []; track category.slug) {
                  <li>
                    <a
                      routerLink="/activities"
                      [queryParams]="{ category: category.slug }"
                      class="flex min-h-11 items-center pl-3"
                      >{{ category.name }}</a
                    >
                  </li>
                }
              </ul>
            </details>
            <a
              routerLink="/activities"
              class="flex min-h-12 items-center text-lg font-semibold"
              i18n="@@header.allTrips"
              >All trips</a
            >
          </div>
        </nav>
      }
    </header>
  `,
})
export class SiteHeader {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly openMenu = signal<MenuId | null>(null);
  protected readonly mobileOpen = signal(false);

  protected readonly menus: { id: MenuId; label: string }[] = [
    { id: 'destinations', label: $localize`:@@header.destinations:Destinations` },
    { id: 'ways', label: $localize`:@@header.waysToTravel:Ways to travel` },
  ];

  protected readonly types = [
    { value: 'EXCURSION', label: $localize`:@@filters.excursion:Excursions` },
    { value: 'ACTIVITY', label: $localize`:@@filters.activity:Activities` },
  ];

  private readonly cityList = httpResource<City[]>(() => catalogApi.cities());
  protected readonly categories = httpResource<Category[]>(() => catalogApi.categories());

  /** Launch cities in travel order, then any city added later. */
  protected readonly cities = computed(() => {
    const order = (slug: string) => {
      const index = CITY_ORDER.indexOf(slug);
      return index === -1 ? CITY_ORDER.length : index;
    };
    return [...(this.cityList.value() ?? [])].sort((a, b) => order(a.slug) - order(b.slug));
  });

  constructor() {
    // Any navigation closes every menu (root component: lives as long as the app).
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.openMenu.set(null);
        this.mobileOpen.set(false);
      });
  }

  protected toggle(menu: MenuId): void {
    this.openMenu.update((open) => (open === menu ? null : menu));
  }

  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.openMenu.set(null);
    }
  }
}
