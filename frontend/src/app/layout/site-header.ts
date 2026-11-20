import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../shared/ui/icon';
import { LanguageSwitcher } from './language-switcher';

interface NavLink {
  label: string;
  commands: string[];
}

@Component({
  selector: 'trv-site-header',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcher, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur">
      <div class="container-page flex h-16 items-center justify-between gap-4">
        <a
          routerLink="/"
          class="font-display text-2xl font-semibold text-ink-900"
          (click)="menuOpen.set(false)"
        >
          Trivallo<span class="text-terracotta-500">.</span>
        </a>

        <nav
          class="hidden items-center gap-6 md:flex"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          @for (link of links; track link.label) {
            <a
              [routerLink]="link.commands"
              routerLinkActive="text-teal-700"
              class="text-sm font-semibold text-ink-700 hover:text-teal-700"
              >{{ link.label }}</a
            >
          }
        </nav>

        <div class="flex items-center gap-3">
          <trv-language-switcher />
          <button
            type="button"
            class="rounded-full p-2 text-ink-700 hover:bg-sand-100 md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            (click)="menuOpen.update((open) => !open)"
          >
            <span class="sr-only" i18n="@@header.menu">Menu</span>
            <trv-icon [name]="menuOpen() ? 'x' : 'menu'" class="size-5" />
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav
          id="mobile-menu"
          class="border-t border-sand-200 bg-sand-50 md:hidden"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          <div class="container-page flex flex-col py-2">
            @for (link of links; track link.label) {
              <a
                [routerLink]="link.commands"
                class="py-3 text-base font-semibold text-ink-700"
                (click)="menuOpen.set(false)"
                >{{ link.label }}</a
              >
            }
          </div>
        </nav>
      }
    </header>
  `,
})
export class SiteHeader {
  protected readonly menuOpen = signal(false);

  protected readonly links: NavLink[] = [
    { label: $localize`:@@header.allActivities:All activities`, commands: ['/activities'] },
    { label: 'Marrakech', commands: ['/cities', 'marrakech'] },
    { label: 'Ouarzazate', commands: ['/cities', 'ouarzazate'] },
    { label: 'Merzouga', commands: ['/cities', 'merzouga'] },
  ];
}
