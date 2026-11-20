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
    <header class="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div class="container-page flex h-16 items-center justify-between gap-4">
        <a
          routerLink="/"
          class="flex min-h-11 items-center gap-2 text-xl font-extrabold tracking-tight"
          (click)="menuOpen.set(false)"
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
          class="hidden items-center gap-1 md:flex"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          @for (link of links; track link.label) {
            <a
              [routerLink]="link.commands"
              routerLinkActive="!text-foreground after:bg-primary"
              class="relative flex min-h-11 items-center px-3 font-semibold text-muted-foreground transition-colors duration-200 after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 hover:text-foreground"
              >{{ link.label }}</a
            >
          }
        </nav>

        <div class="flex items-center gap-1">
          <trv-language-switcher />
          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            (click)="menuOpen.update((open) => !open)"
          >
            <span class="sr-only" i18n="@@header.menu">Menu</span>
            <trv-icon [name]="menuOpen() ? 'x' : 'menu'" class="size-6" />
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav
          id="mobile-menu"
          class="border-t border-border md:hidden"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          <div class="container-page flex flex-col py-2">
            @for (link of links; track link.label) {
              <a
                [routerLink]="link.commands"
                routerLinkActive="text-primary"
                class="flex min-h-12 items-center text-lg font-semibold"
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
    { label: 'Marrakech', commands: ['/cities', 'marrakech'] },
    { label: 'Ouarzazate', commands: ['/cities', 'ouarzazate'] },
    { label: 'Merzouga', commands: ['/cities', 'merzouga'] },
    { label: $localize`:@@header.allActivities:All activities`, commands: ['/activities'] },
  ];
}
