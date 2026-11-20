import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ActivityFilters, ActivityType, Category, City } from '../../core/api/catalog.models';
import { Icon } from '../../shared/ui/icon';

interface Option<T> {
  value: T;
  label: string;
}

/** Stateless filter form: shows the filters it is given and emits each change. The URL is the source of truth. */
@Component({
  selector: 'trv-activity-filter-panel',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn-ghost w-full lg:hidden"
      [attr.aria-expanded]="open()"
      aria-controls="activity-filters"
      (click)="open.update((value) => !value)"
    >
      <trv-icon name="filters" class="size-4" />
      <ng-container i18n="@@filters.toggle">Filters</ng-container>
      @if (hasActiveFilters()) {
        <span class="size-2 rounded-full bg-accent" aria-hidden="true"></span>
      }
    </button>

    <form
      id="activity-filters"
      i18n-aria-label="@@filters.label"
      aria-label="Filter activities"
      class="mt-3 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:mt-0 lg:block"
      [class.hidden]="!open()"
      (submit)="$event.preventDefault()"
    >
      @if (showCity()) {
        <label class="block">
          <span class="field-label" i18n="@@filters.city">City</span>
          <select class="field" (change)="emit('city', $any($event.target).value)">
            <option value="" i18n="@@filters.anyCity">Any city</option>
            @for (city of cities(); track city.slug) {
              <option [value]="city.slug" [selected]="city.slug === filters().city">
                {{ city.name }}
              </option>
            }
          </select>
        </label>
      }

      <label class="block">
        <span class="field-label" i18n="@@filters.category">Experience</span>
        <select class="field" (change)="emit('category', $any($event.target).value)">
          <option value="" i18n="@@filters.anyCategory">Any experience</option>
          @for (category of categories(); track category.slug) {
            <option [value]="category.slug" [selected]="category.slug === filters().category">
              {{ category.name }}
            </option>
          }
        </select>
      </label>

      <label class="block">
        <span class="field-label" i18n="@@filters.type">Type</span>
        <select class="field" (change)="emit('type', $any($event.target).value)">
          @for (option of typeOptions; track option.value) {
            <option [value]="option.value" [selected]="option.value === (filters().type ?? '')">
              {{ option.label }}
            </option>
          }
        </select>
      </label>

      <label class="block">
        <span class="field-label" i18n="@@filters.maxPrice">Budget per adult</span>
        <select class="field" (change)="emit('maxPrice', $any($event.target).value)">
          @for (option of priceOptions; track option.value) {
            <option
              [value]="option.value"
              [selected]="option.value === String(filters().maxPrice ?? '')"
            >
              {{ option.label }}
            </option>
          }
        </select>
      </label>

      <label class="block">
        <span class="field-label" i18n="@@filters.duration">Duration</span>
        <select class="field" (change)="emit('maxDuration', $any($event.target).value)">
          @for (option of durationOptions; track option.value) {
            <option
              [value]="option.value"
              [selected]="option.value === String(filters().maxDuration ?? '')"
            >
              {{ option.label }}
            </option>
          }
        </select>
      </label>

      @if (hasActiveFilters()) {
        <button
          type="button"
          class="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-200 hover:text-destructive"
          (click)="clear.emit()"
          i18n="@@filters.clear"
        >
          Clear filters
        </button>
      }
    </form>
  `,
})
export class ActivityFilterPanel {
  readonly filters = input.required<ActivityFilters>();
  readonly cities = input<City[]>([]);
  readonly categories = input<Category[]>([]);
  readonly showCity = input(true);
  readonly hasActiveFilters = input(false);

  readonly changed = output<Partial<ActivityFilters>>();
  readonly clear = output<void>();

  /** Collapsed on phones, always visible from the lg breakpoint. */
  protected readonly open = signal(false);

  protected readonly typeOptions: Option<ActivityType | ''>[] = [
    { value: '', label: $localize`:@@filters.anyType:Excursions and activities` },
    { value: 'EXCURSION', label: $localize`:@@filters.excursion:Excursions` },
    { value: 'ACTIVITY', label: $localize`:@@filters.activity:Activities` },
  ];

  protected readonly priceOptions: Option<string>[] = [
    { value: '', label: $localize`:@@filters.anyPrice:Any budget` },
    { value: '50', label: $localize`:@@filters.price50:Up to €50` },
    { value: '100', label: $localize`:@@filters.price100:Up to €100` },
    { value: '200', label: $localize`:@@filters.price200:Up to €200` },
  ];

  protected readonly durationOptions: Option<string>[] = [
    { value: '', label: $localize`:@@filters.anyDuration:Any duration` },
    { value: '240', label: $localize`:@@filters.duration4h:Up to 4 hours` },
    { value: '480', label: $localize`:@@filters.duration8h:Up to a full day` },
  ];

  protected readonly String = String;

  protected emit(key: keyof ActivityFilters, value: string): void {
    this.changed.emit({ [key]: value === '' ? null : value });
  }
}
