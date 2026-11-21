import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';
import { validationMessage } from './form-utils';

/**
 * Client-side validation message under a field, shown once the field was touched.
 * It listens to the control's events because an OnPush component is not re-rendered
 * when the parent calls markAllAsTouched().
 */
@Component({
  selector: 'trv-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as message) {
      <p class="mt-1 text-sm text-red-700">{{ message }}</p>
    }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl>();

  protected readonly message = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) =>
        control.events.pipe(
          startWith(null),
          map(() =>
            control.invalid && (control.touched || control.dirty)
              ? validationMessage(control.errors)
              : null,
          ),
        ),
      ),
    ),
    { initialValue: null },
  );
}
