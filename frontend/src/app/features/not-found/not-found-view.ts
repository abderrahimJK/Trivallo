import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpStatusService } from '../../core/http/http-status.service';
import { SeoService } from '../../core/seo/seo.service';
import { Dunes } from '../../shared/ui/dunes';

/** Shown for unknown URLs and unknown slugs. Makes the server answer 404 so search engines drop the page. */
@Component({
  selector: 'trv-not-found-view',
  imports: [RouterLink, Dunes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="aurora relative isolate overflow-hidden text-white">
      <div class="absolute inset-0 -z-10 bg-[#082f49]/45"></div>
      <div
        class="container-page flex flex-col items-center pt-16 pb-40 text-center sm:pt-24 sm:pb-52"
      >
        <p
          class="font-display text-[10rem] leading-none text-white/90 sm:text-[16rem]"
          aria-hidden="true"
        >
          404
        </p>
        <h1 class="text-balance mt-2 text-5xl sm:text-7xl" i18n="@@notFound.title">
          This page got lost in the dunes
        </h1>
        <p class="mt-3 max-w-md text-lg text-white/90" i18n="@@notFound.text">
          The page you are looking for does not exist or is no longer available.
        </p>
        <a routerLink="/activities" class="btn-accent mt-8" i18n="@@notFound.cta"
          >Browse activities</a
        >
      </div>
      <trv-dunes class="absolute inset-x-0 bottom-0 h-24 text-background sm:h-40" />
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
