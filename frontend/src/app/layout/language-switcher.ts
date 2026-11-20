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
    <div class="flex items-center gap-1 text-sm">
      <trv-icon name="globe" class="size-4 text-ink-500" />
      @for (locale of locales; track locale.code) {
        @if (locale.code === currentLocale) {
          <span
            class="rounded-full bg-sand-200 px-2 py-0.5 font-semibold uppercase"
            aria-current="true"
            >{{ locale.code }}</span
          >
        } @else {
          <a
            class="rounded-full px-2 py-0.5 font-semibold text-ink-500 uppercase hover:text-ink-900"
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
