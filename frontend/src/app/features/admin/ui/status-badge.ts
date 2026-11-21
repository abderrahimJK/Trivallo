import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ActivityStatus } from '../api/admin.models';

const STYLES: Record<ActivityStatus, { label: string; classes: string }> = {
  PUBLISHED: { label: 'Published', classes: 'bg-emerald-100 text-emerald-900' },
  DRAFT: { label: 'Draft', classes: 'bg-amber-100 text-amber-900' },
  ARCHIVED: { label: 'Archived', classes: 'bg-stone-200 text-stone-800' },
};

@Component({
  selector: 'trv-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="tag" [class]="style().classes">{{ style().label }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<ActivityStatus>();
  protected readonly style = computed(() => STYLES[this.status()]);
}
