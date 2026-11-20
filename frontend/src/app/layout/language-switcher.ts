import { ChangeDetectionStrategy, Component, computed, inject, LOCALE_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { SITE_LOCALES } from '../core/i18n/locales';
import { Icon } from '../shared/ui/icon';

/**
 * Each language is its own build under /en or /fr, so switching is a full page load
 * to the same page in the other locale (plain href, not routerLink).
 */
@Component({
  selector: 'trv-language-switcher',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-0.5 text-sm">
      <trv-icon name="globe" class="mr-1 size-4 text-muted-foreground" />
      @for (locale of locales; track locale.code) {
        @if (locale.code === currentLocale) {
          <span
            class="flex size-9 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background uppercase"
            aria-current="true"
            >{{ locale.code }}</span
          >
        } @else {
          <a
            class="flex size-11 items-center justify-center rounded-lg text-sm font-bold text-muted-foreground uppercase transition-colors duration-200 hover:bg-muted hover:text-foreground"
            [href]="'/' + locale.code + currentPath()"
            [attr.hreflang]="locale.code"
            [attr.lang]="locale.code"
            [attr.aria-label]="locale.label"
            >{{ locale.code }}</a
          >
        }
      }
    </div>
  `,
})
export class LanguageSwitcher {
  private readonly router = inject(Router);

  protected readonly locales = SITE_LOCALES;
  protected readonly currentLocale = inject(LOCALE_ID);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentPath = computed(() => (this.url() === '/' ? '' : this.url()));
}
