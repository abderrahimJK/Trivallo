import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { ActivityBrowser } from './activity-browser';
import { toActivityFilters } from './query-filters';

@Component({
  selector: 'trv-activities-page',
  imports: [ActivityBrowser],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container-page pt-10">
      <h1 class="text-4xl" i18n="@@activities.title">Excursions and activities</h1>
      <p class="mt-2 max-w-2xl text-ink-500" i18n="@@activities.subtitle">
        Desert nights, mountain day trips, balloon flights and cooking classes across Marrakech,
        Ouarzazate and Merzouga.
      </p>
      <trv-activity-browser class="mt-8 block" [filters]="filters()" />
    </section>
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
