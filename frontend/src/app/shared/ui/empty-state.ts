import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'trv-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center"
    >
      <trv-icon [name]="icon()" class="size-10 text-muted-foreground" />
      <p class="text-xl font-bold">{{ title() }}</p>
      <div class="max-w-md text-muted-foreground"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly icon = input('dune');
}
