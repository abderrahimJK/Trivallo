import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BOOKING_FAQ } from '../../core/content/booking-faq';
import { Faq } from './faq';

/** The booking FAQ block shared by the home, destination and list pages. */
@Component({
  selector: 'trv-faq-section',
  imports: [Faq],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" class="section-title" i18n="@@faq.title">Frequently asked questions</h2>
      <trv-faq class="mt-6" [items]="items" />
    </section>
  `,
})
export class FaqSection {
  protected readonly items = BOOKING_FAQ;
}
