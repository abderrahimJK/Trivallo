import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DayOfWeek } from '../../core/api/catalog.models';

const ORDER: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

/** Reference Monday (2024-01-01) so each day name comes from Intl in the page locale. */
const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1);
const DAY_MS = 86_400_000;

/** ["MONDAY", "WEDNESDAY"] -> "Mon, Wed" (or "lun., mer." in French). */
@Pipe({ name: 'weekdays' })
export class WeekdaysPipe implements PipeTransform {
  private readonly format = new Intl.DateTimeFormat(inject(LOCALE_ID), {
    weekday: 'short',
    timeZone: 'UTC',
  });

  transform(days: DayOfWeek[] | null | undefined, everyDayLabel: string): string {
    if (!days?.length) {
      return '';
    }
    if (days.length === 7) {
      return everyDayLabel;
    }
    return ORDER.filter((day) => days.includes(day))
      .map((day) => this.format.format(REFERENCE_MONDAY_UTC + ORDER.indexOf(day) * DAY_MS))
      .join(', ');
  }
}
