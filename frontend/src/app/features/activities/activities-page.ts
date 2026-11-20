import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { Dunes } from '../../shared/ui/dunes';
import { ActivityBrowser } from './activity-browser';
import { toActivityFilters } from './query-filters';

@Component({
  selector: 'trv-activities-page',
  imports: [ActivityBrowser, Dunes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="aurora relative isolate overflow-hidden text-white">
      <div class="absolute inset-0 -z-10 bg-[#082f49]/45"></div>
      <div class="container-page pt-12 pb-24 sm:pt-16 sm:pb-28">
        <h1 class="animate-rise max-w-3xl text-6xl sm:text-8xl" i18n="@@activities.title">
          Excursions and activities
        </h1>
        <p class="mt-3 max-w-2xl text-lg text-white/90" i18n="@@activities.subtitle">
          Desert nights, mountain day trips, balloon flights and cooking classes across Marrakech,
          Ouarzazate and Merzouga.
        </p>
      </div>
      <trv-dunes class="absolute inset-x-0 bottom-0 h-16 text-background sm:h-20" />
    </section>
    <div class="container-page mt-6">
      <trv-activity-browser [filters]="filters()" />
    </div>
  `,
})
export class ActivitiesPage implements OnInit {
  // Query params, bound by withComponentInputBinding().
  readonly city = input<string>();
  readonly category = input<string>();
  readonly type = input<string>();
  readonly maxPrice = input<string>();
  readonly maxDuration = input<string>();
  readonly page = input<string>();

  private readonly seo = inject(SeoService);

  protected readonly filters = computed(() =>
    toActivityFilters({
      city: this.city(),
      category: this.category(),
      type: this.type(),
      maxPrice: this.maxPrice(),
      maxDuration: this.maxDuration(),
      page: this.page(),
    }),
  );

  ngOnInit(): void {
    this.seo.update({
      title: $localize`:@@activities.seoTitle:All excursions and activities`,
      description: $localize`:@@activities.seoDescription:Compare and book excursions and activities in Marrakech, Ouarzazate and Merzouga, with prices in euros.`,
    });
  }
}
