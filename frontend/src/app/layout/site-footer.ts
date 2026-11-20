import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'trv-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-24 bg-foreground text-background">
      <div class="container-page grid gap-10 py-14 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p class="text-2xl font-extrabold tracking-tight">Trivallo</p>
          <p class="mt-3 max-w-xs text-background/80" i18n="@@footer.tagline">
            Hand-picked excursions and activities in Marrakech, Ouarzazate and Merzouga.
          </p>
        </div>
        <div>
          <p class="font-bold" i18n="@@footer.destinations">Destinations</p>
          <ul class="mt-2">
            @for (city of cities; track city.slug) {
              <li>
                <a
                  [routerLink]="['/cities', city.slug]"
                  class="flex min-h-11 items-center text-background/80 hover:text-background hover:underline"
                  >{{ city.name }}</a
                >
              </li>
            }
          </ul>
        </div>
        <div>
          <p class="font-bold" i18n="@@footer.howItWorks">How it works</p>
          <p class="mt-3 text-background/80" i18n="@@footer.howItWorksText">
            Send a booking request, our team confirms it with the local guide, and you pay on the
            day.
          </p>
        </div>
      </div>
      <div class="border-t border-background/15">
        <p class="container-page py-5 text-sm text-background/70">© {{ year }} Trivallo</p>
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
