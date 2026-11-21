import { RenderMode, ServerRoute } from '@angular/ssr';

/** Catalogue content changes through the admin, so pages are rendered per request rather than prerendered. */
export const serverRoutes: ServerRoute[] = [
  // The admin needs the signed-in browser session, so the server only sends the app shell.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
