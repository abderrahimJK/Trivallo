import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'trv-empty-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-sand-300 px-6 py-12 text-center"
    >
      <trv-icon [name]="icon()" class="size-10 text-terracotta-500" />
      <p class="font-semibold text-ink-900">{{ title() }}</p>
      <div class="max-w-md text-sm text-ink-500"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly icon = input('dune');
}
