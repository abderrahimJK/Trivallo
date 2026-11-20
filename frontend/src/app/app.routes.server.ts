import { RenderMode, ServerRoute } from '@angular/ssr';

/** Catalogue content changes through the admin, so pages are rendered per request rather than prerendered. */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
