import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'trv-admin-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        @if (backLink()) {
          <a [routerLink]="backLink()" class="link text-sm">&larr; {{ backLabel() }}</a>
        }
        <h1 class="mt-1 text-2xl font-bold sm:text-3xl">{{ title() }}</h1>
      </div>
      <ng-content />
    </div>
  `,
})
export class AdminPageHeader {
  readonly title = input.required<string>();
  readonly backLink = input<string | null>(null);
  readonly backLabel = input('Back');
}
