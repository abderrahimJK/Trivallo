import { FaqItem } from '../../shared/ui/faq';

/** Booking questions shown on the home, destination and list pages. Static until we have a CMS. */
export const BOOKING_FAQ: FaqItem[] = [
  {
    question: $localize`:@@faq.payQ:Do I pay online?`,
    answer: $localize`:@@faq.payA:No. You send a booking request, we confirm it with the local guide by email, and you pay the guide on the day in cash or by card where accepted.`,
  },
  {
    question: $localize`:@@faq.confirmQ:How quickly is my booking confirmed?`,
    answer: $localize`:@@faq.confirmA:Usually within 24 hours. If the date is full we suggest the closest available day.`,
  },
  {
    question: $localize`:@@faq.pickupQ:Is hotel pick-up included?`,
    answer: $localize`:@@faq.pickupA:It depends on the trip. Each trip lists what is included and where you meet the guide.`,
  },
  {
    question: $localize`:@@faq.cancelQ:Can I cancel?`,
    answer: $localize`:@@faq.cancelA:Yes. Since nothing is paid in advance, just let us know as early as possible so the guide can free your place.`,
  },
];
