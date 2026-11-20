import { Pipe, PipeTransform } from '@angular/core';
import { ActivityType } from '../../core/api/catalog.models';

const LABELS: Record<ActivityType, string> = {
  EXCURSION: $localize`:@@activityType.excursion:Excursion`,
  ACTIVITY: $localize`:@@activityType.activity:Activity`,
};

@Pipe({ name: 'activityTypeLabel' })
export class ActivityTypeLabelPipe implements PipeTransform {
  transform(type: ActivityType): string {
    return LABELS[type];
  }
}
