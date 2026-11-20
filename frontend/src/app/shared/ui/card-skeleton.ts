import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'trv-card-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <div class="animate-pulse">
      <div class="aspect-[4/3] rounded-xl bg-muted"></div>
      <div class="mt-4 h-4 w-1/3 rounded bg-muted"></div>
      <div class="mt-3 h-5 w-5/6 rounded bg-muted"></div>
      <div class="mt-2 h-4 w-1/2 rounded bg-muted"></div>
    </div>
  `,
})
export class CardSkeleton {}
