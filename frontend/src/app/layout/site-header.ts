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
    <header class="sticky top-0 z-30 bg-foreground/95 text-white backdrop-blur">
      <div class="container-page flex h-16 items-center justify-between gap-4">
        <a
          routerLink="/"
          class="font-display flex min-h-11 items-center text-3xl tracking-widest"
          (click)="menuOpen.set(false)"
        >
          Trivallo<span class="text-accent">.</span>
        </a>

        <nav
          class="hidden items-center gap-1 md:flex"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          @for (link of links; track link.label) {
            <a
              [routerLink]="link.commands"
              routerLinkActive="!text-white after:scale-x-100"
              class="relative flex min-h-11 items-center px-3 text-sm font-semibold text-white/80 transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 hover:text-white hover:after:scale-x-100"
              >{{ link.label }}</a
            >
          }
        </nav>

        <div class="flex items-center gap-2">
          <trv-language-switcher />
          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 md:hidden"
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
          class="border-t border-white/10 md:hidden"
          i18n-aria-label="@@header.navLabel"
          aria-label="Main"
        >
          <div class="container-page flex flex-col py-3">
            @for (link of links; track link.label) {
              <a
                [routerLink]="link.commands"
                routerLinkActive="text-accent"
                class="font-display flex min-h-12 items-center text-3xl tracking-wide"
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
