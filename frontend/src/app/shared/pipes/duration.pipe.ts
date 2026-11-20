import { Pipe, PipeTransform } from '@angular/core';

/** 240 -> "4 h", 90 -> "1 h 30", 45 -> "45 min". Same notation in English and French. */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) {
      return '';
    }
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) {
      return `${rest} min`;
    }
    return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, '0')}`;
  }
}
