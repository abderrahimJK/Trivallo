import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'trv-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-14 text-center"
    >
      <span class="flex size-16 items-center justify-center rounded-full bg-muted">
        <trv-icon [name]="icon()" class="size-8 text-foreground" />
      </span>
      <p class="font-display text-3xl text-foreground">{{ title() }}</p>
      <div class="max-w-md text-muted-foreground"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly icon = input('dune');
}
