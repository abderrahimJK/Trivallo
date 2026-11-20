import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dunes } from '../shared/ui/dunes';

@Component({
  selector: 'trv-site-footer',
  imports: [RouterLink, Dunes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-24 text-white">
      <trv-dunes class="h-16 text-foreground sm:h-24" />
      <div class="bg-foreground">
        <div class="container-page grid gap-10 pt-6 pb-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p class="font-display text-6xl tracking-widest">
              Trivallo<span class="text-accent">.</span>
            </p>
            <p class="mt-3 max-w-xs text-white/80" i18n="@@footer.tagline">
              Hand-picked excursions and activities in Marrakech, Ouarzazate and Merzouga.
            </p>
          </div>
          <div>
            <p class="eyebrow text-white/70" i18n="@@footer.destinations">Destinations</p>
            <ul class="mt-2">
              @for (city of cities; track city.slug) {
                <li>
                  <a
                    [routerLink]="['/cities', city.slug]"
                    class="font-display flex min-h-11 items-center text-2xl tracking-wide transition-colors duration-200 hover:text-accent"
                    >{{ city.name }}</a
                  >
                </li>
              }
            </ul>
          </div>
          <div>
            <p class="eyebrow text-white/70" i18n="@@footer.howItWorks">How it works</p>
            <p class="mt-3 text-white/80" i18n="@@footer.howItWorksText">
              Send a booking request, our team confirms it with the local guide, and you pay on the
              day.
            </p>
          </div>
        </div>
        <div class="border-t border-white/10">
          <p class="container-page py-5 text-sm text-white/70">© {{ year }} Trivallo</p>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly year = new Date().getFullYear();

  protected readonly cities = [
    { slug: 'marrakech', name: 'Marrakech' },
    { slug: 'ouarzazate', name: 'Ouarzazate' },
    { slug: 'merzouga', name: 'Merzouga' },
  ];
}
