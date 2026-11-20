import { DOCUMENT, inject, Injectable, LOCALE_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DEFAULT_LOCALE, SITE_LOCALES, SITE_ORIGIN } from '../i18n/locales';

export interface PageSeo {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

const SITE_NAME = 'Trivallo';

/**
 * Sets the title, description, canonical URL, hreflang alternates and Open Graph tags
 * for the current page. Runs during SSR so crawlers get them in the HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly origin = inject(SITE_ORIGIN);

  update(page: PageSeo): void {
    const fullTitle = page.title === SITE_NAME ? SITE_NAME : `${page.title} | ${SITE_NAME}`;
    const path = this.router.url.split(/[?#]/)[0];
    const canonical = this.localizedUrl(this.locale, path);

    this.document.documentElement.lang = this.locale;
    this.title.setTitle(fullTitle);
    this.setMeta('name', 'description', page.description);
    this.setMeta('property', 'og:title', fullTitle);
    this.setMeta('property', 'og:description', page.description);
    this.setMeta('property', 'og:url', canonical);
    this.setMeta('property', 'og:site_name', SITE_NAME);
    this.setMeta('property', 'og:locale', this.locale === 'fr' ? 'fr_FR' : 'en_GB');
    this.setMeta('property', 'og:image', page.imageUrl ? this.origin + page.imageUrl : null);

    this.setLinks(canonical, path);
  }

  private localizedUrl(locale: string, path: string): string {
    return `${this.origin}/${locale}${path === '/' ? '' : path}`;
  }

  private setMeta(
    attribute: 'name' | 'property',
    key: string,
    content: string | null | undefined,
  ): void {
    const selector = `${attribute}="${key}"`;
    if (content) {
      this.meta.updateTag({ [attribute]: key, content }, selector);
    } else {
      this.meta.removeTag(selector);
    }
  }

  private setLinks(canonical: string, path: string): void {
    const head = this.document.head;
    head.querySelectorAll('link[data-seo]').forEach((link) => link.remove());

    this.appendLink({ rel: 'canonical', href: canonical });
    for (const { code } of SITE_LOCALES) {
      this.appendLink({ rel: 'alternate', hreflang: code, href: this.localizedUrl(code, path) });
    }
    this.appendLink({
      rel: 'alternate',
      hreflang: 'x-default',
      href: this.localizedUrl(DEFAULT_LOCALE, path),
    });
  }

  private appendLink(attributes: Record<string, string>): void {
    const link = this.document.createElement('link');
    link.setAttribute('data-seo', '');
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }
    this.document.head.appendChild(link);
  }
}
