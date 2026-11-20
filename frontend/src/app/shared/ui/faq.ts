import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';

export interface FaqItem {
  question: string;
  answer: string;
}

/** Native details/summary accordion: keyboard and screen-reader friendly, works without JS. */
@Component({
  selector: 'trv-faq',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="divide-y divide-border border-y border-border">
      @for (item of items(); track item.question) {
        <details class="group">
          <summary
            class="flex min-h-14 list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden"
          >
            {{ item.question }}
            <trv-icon
              name="chevron-right"
              class="size-5 shrink-0 transition-transform duration-200 group-open:rotate-90"
            />
          </summary>
          <p class="max-w-3xl pb-5 text-muted-foreground">{{ item.answer }}</p>
        </details>
      }
    </div>
  `,
})
export class Faq {
  readonly items = input.required<FaqItem[]>();
}
