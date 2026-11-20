import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'trv-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-20 bg-ink-900 text-sand-100">
      <div class="container-page grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p class="font-display text-2xl">Trivallo<span class="text-terracotta-400">.</span></p>
          <p class="mt-3 max-w-xs text-sm text-sand-200/80" i18n="@@footer.tagline">
            Hand-picked excursions and activities in Marrakech, Ouarzazate and Merzouga.
          </p>
        </div>
        <div>
          <p
            class="text-xs font-semibold tracking-wide text-sand-300 uppercase"
            i18n="@@footer.destinations"
          >
            Destinations
          </p>
          <ul class="mt-3 space-y-2 text-sm">
            <li><a routerLink="/cities/marrakech" class="hover:text-white">Marrakech</a></li>
            <li><a routerLink="/cities/ouarzazate" class="hover:text-white">Ouarzazate</a></li>
            <li><a routerLink="/cities/merzouga" class="hover:text-white">Merzouga</a></li>
          </ul>
        </div>
        <div>
          <p
            class="text-xs font-semibold tracking-wide text-sand-300 uppercase"
            i18n="@@footer.howItWorks"
          >
            How it works
          </p>
          <p class="mt-3 text-sm text-sand-200/80" i18n="@@footer.howItWorksText">
            Send a booking request, our team confirms it with the local guide, and you pay on the
            day.
          </p>
        </div>
      </div>
      <div class="border-t border-white/10">
        <p class="container-page py-5 text-xs text-sand-200/60">© {{ year }} Trivallo</p>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();
}
