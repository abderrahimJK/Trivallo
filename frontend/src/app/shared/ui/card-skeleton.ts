import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'trv-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <div
      class="animate-pulse overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]"
    >
      <div class="aspect-[4/3] bg-sand-100"></div>
      <div class="space-y-3 p-4">
        <div class="h-3 w-1/2 rounded bg-sand-100"></div>
        <div class="h-4 w-5/6 rounded bg-sand-200"></div>
        <div class="h-3 w-full rounded bg-sand-100"></div>
      </div>
    </div>
  `,
})
export class CardSkeleton {}
