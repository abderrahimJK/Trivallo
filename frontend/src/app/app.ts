import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';

@Component({
  selector: 'trv-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  template: `
    @if (inAdmin()) {
      <!-- The admin brings its own layout (sidebar and top bar). -->
      <router-outlet />
    } @else {
      <div class="flex min-h-dvh flex-col">
        <trv-site-header />
        <main class="flex-1">
          <router-outlet />
        </main>
        <trv-site-footer />
      </div>
    }
  `,
})
export class App {
  private readonly router = inject(Router);

  protected readonly inAdmin = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => isAdminUrl(event.urlAfterRedirects)),
    ),
    { initialValue: isAdminUrl(this.router.url) },
  );
}

function isAdminUrl(url: string): boolean {
  return url === '/admin' || url.startsWith('/admin/') || url.startsWith('/admin?');
}
