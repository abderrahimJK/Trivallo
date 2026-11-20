import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpStatusService } from '../../core/http/http-status.service';
import { SeoService } from '../../core/seo/seo.service';

/** Shown for unknown URLs and unknown slugs. Makes the server answer 404 so search engines drop the page. */
@Component({
  selector: 'trv-not-found-view',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container-page flex flex-col items-center py-24 text-center">
      <p class="font-display text-7xl text-terracotta-500">404</p>
      <h1 class="mt-4 text-3xl" i18n="@@notFound.title">This page got lost in the dunes</h1>
      <p class="mt-2 max-w-md text-ink-500" i18n="@@notFound.text">
        The page you are looking for does not exist or is no longer available.
      </p>
      <a routerLink="/activities" class="btn-primary mt-8" i18n="@@notFound.cta"
        >Browse activities</a
      >
    </section>
  `,
})
export class NotFoundView implements OnInit {
  private readonly httpStatus = inject(HttpStatusService);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.httpStatus.setStatus(404);
    this.seo.update({ title: $localize`:@@notFound.seoTitle:Page not found` });
  }
}
