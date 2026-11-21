import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Client-side validation message under a field, shown once the field was touched. */
@Component({
  selector: 'trv-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = control();
    @if (c.invalid && (c.touched || c.dirty)) {
      <p class="mt-1 text-sm text-red-700">{{ message(c) }}</p>
    }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();

  protected message(control: AbstractControl): string {
    const errors = control.errors ?? {};
    if (errors['required']) return 'Required.';
    if (errors['pattern']) return 'Use lowercase letters, digits and hyphens.';
    if (errors['maxlength']) return `At most ${errors['maxlength'].requiredLength} characters.`;
    if (errors['min']) return `Must be at least ${errors['min'].min}.`;
    if (errors['max']) return `Must be at most ${errors['max'].max}.`;
    if (errors['https']) return 'Must be an https:// link.';
    return 'Invalid value.';
  }
}
