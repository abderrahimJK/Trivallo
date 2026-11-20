import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'trv-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <div class="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div class="aspect-[4/3] bg-muted"></div>
      <div class="space-y-3 p-5">
        <div class="h-3 w-1/2 rounded bg-muted"></div>
        <div class="h-4 w-5/6 rounded bg-border"></div>
        <div class="h-3 w-full rounded bg-muted"></div>
      </div>
    </div>
  `,
})
export class CardSkeleton {}
