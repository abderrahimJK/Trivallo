# Trivallo frontend

Angular 22 with server-side rendering, Tailwind CSS v4 and Angular's built-in i18n.
See the root README for the full stack and conventions.

## Develop

```bash
npm ci
npm start          # English at http://localhost:4200, API proxied to http://localhost:8080
npm run start:fr   # same, French build
```

The backend must be running (see the root README). `ng serve` serves one locale at a time.

## Build and run like production

```bash
npm run build      # dist/trivallo/browser/{en,fr} + dist/trivallo/server
SITE_ORIGIN=http://localhost:4000 npm run serve:ssr
```

`/` redirects to `/en` or `/fr` from the browser's `Accept-Language`. In production Nginx sends
`/api` to the backend; the Node server alone does not, so client-side filtering needs Nginx (or
`npm start`, which proxies).

| Variable | Default | Purpose |
|---|---|---|
| `API_ORIGIN` | `http://localhost:8080` | Where the SSR server calls the API (inside Docker: `http://backend:8080`) |
| `SITE_ORIGIN` | `http://localhost:4000` | Public origin for canonical/hreflang URLs and the SSR transfer cache |
| `NG_ALLOWED_HOSTS` | `localhost` | Extra Host headers the SSR server accepts (the production domain) |
| `PORT` | `4000` | SSR server port |

## Structure

```
src/app
├── core        API URLs and models, HTTP interceptors, locales, SEO, HTTP status
├── shared      reusable UI (cards, media frame, icons, pagination) and pipes
├── layout      header, footer, language switcher
└── features    home, activities (list + filters), activity-detail, city, not-found
```

- **Data:** `httpResource` per page; filters live in the URL query params, so every filtered
  list is shareable and crawlable. No global store yet (NgRx SignalStore arrives with login and booking).
- **SSR:** API responses fetched on the server are embedded in the page and reused by the
  browser, so hydration makes no duplicate API calls. Unknown slugs return a real HTTP 404.

## Design system

The look comes from `design-system/trivallo/` at the repo root (`MASTER.md`, `tokens.css`,
`tokens.json`), generated with the ui-ux-pro-max skill in `.claude/skills/`. Current direction is
**revision 2, "Clean destination guide"**: white pages, Inter, one brand blue for links, one
terracotta CTA, photography first. Pages follow a destination-page pattern: breadcrumb, title,
hero image, refine bar, trip rows with key facts and price, FAQ.

- Change a token in `design-system/trivallo/` first, then mirror it in `src/styles.css` (`@theme`).
- Reusable pieces live in `shared/ui`: `trip-row` (list), `activity-card` (grid), `breadcrumb`,
  `faq` / `faq-section`, `media-frame` (optimized image with a city-tinted placeholder).
- Motion is CSS only and switched off under `prefers-reduced-motion`.

## Translations

Texts are marked with `i18n` attributes or `$localize` and use explicit ids (`@@home.title`).

```bash
npm run extract-i18n                     # updates src/locale/messages.xlf
```

Then add the new units with a `<target>` to `src/locale/messages.fr.xlf`. The build fails on
a missing French translation (`i18nMissingTranslation: error`), so nothing ships half-translated.
