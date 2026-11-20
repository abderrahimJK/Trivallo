import { InjectionToken } from '@angular/core';

export interface SiteLocale {
  code: 'en' | 'fr';
  label: string;
}

/** Each locale is a separate build served under its own path prefix (/en, /fr). */
export const SITE_LOCALES: readonly SiteLocale[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export const DEFAULT_LOCALE = 'en';

/** Public origin of the site, e.g. https://trivallo.com. Used for canonical and hreflang URLs. */
export const SITE_ORIGIN = new InjectionToken<string>('SITE_ORIGIN');

/** "/fr/activities?city=x" -> "/activities?city=x" */
export function stripLocalePrefix(url: string): string {
  const match = url.match(/^\/(en|fr)(?=\/|\?|#|$)/);
  return match ? url.slice(match[0].length) || '/' : url;
}
