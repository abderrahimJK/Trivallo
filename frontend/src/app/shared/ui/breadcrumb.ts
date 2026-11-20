import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  /** Router commands; the last crumb (current page) has none. */
  link?: string[];
}

@Component({
  selector: 'trv-breadcrumb',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="text-sm" i18n-aria-label="@@detail.breadcrumb" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-x-2 text-muted-foreground">
        <li>
          <a
            routerLink="/"
            class="inline-flex min-h-11 items-center hover:text-foreground hover:underline"
            i18n="@@detail.home"
            >Home</a
          >
        </li>
        @for (crumb of crumbs(); track crumb.label) {
          <li aria-hidden="true">/</li>
          <li>
            @if (crumb.link) {
              <a
                [routerLink]="crumb.link"
                class="inline-flex min-h-11 items-center hover:text-foreground hover:underline"
                >{{ crumb.label }}</a
              >
            } @else {
              <span class="font-semibold text-foreground" aria-current="page">{{
                crumb.label
              }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumb {
  readonly crumbs = input.required<Crumb[]>();
}
