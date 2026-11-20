import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo/seo.service';
import { Breadcrumb } from '../../shared/ui/breadcrumb';
import { FaqSection } from '../../shared/ui/faq-section';
import { ActivityBrowser } from './activity-browser';
import { toActivityFilters } from './query-filters';

@Component({
  selector: 'trv-activities-page',
  imports: [ActivityBrowser, Breadcrumb, FaqSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-page pt-2">
      <trv-breadcrumb [crumbs]="crumbs" />
      <h1 class="mt-2 text-4xl sm:text-5xl" i18n="@@activities.title">Excursions and activities</h1>
      <p class="mt-3 max-w-3xl text-lg text-muted-foreground" i18n="@@activities.subtitle">
        Desert nights, mountain day trips, balloon flights and cooking classes across Marrakech,
        Ouarzazate and Merzouga.
      </p>

      <section class="mt-10" aria-labelledby="trips-title">
        <h2 id="trips-title" class="section-title mb-4" i18n="@@activities.listTitle">Our trips</h2>
        <trv-activity-browser [filters]="filters()" />
      </section>

      <trv-faq-section class="mt-20" />
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

  protected readonly crumbs = [{ label: $localize`:@@header.allActivities:All activities` }];

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
