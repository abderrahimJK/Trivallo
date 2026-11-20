import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';

@Component({
  selector: 'trv-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  template: `
    <div class="flex min-h-dvh flex-col">
      <trv-site-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <trv-site-footer />
    </div>
  `,
})
export class App {}
