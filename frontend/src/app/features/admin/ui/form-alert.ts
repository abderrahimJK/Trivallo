import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApiFailure } from '../api/api-errors';

/** Server-side failure of a save: the message plus any field errors the backend listed. */
@Component({
  selector: 'trv-form-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (failure(); as failure) {
      <div role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
        <p class="font-semibold">{{ failure.message }}</p>
        @if (failure.fieldErrors.length) {
          <ul class="mt-2 list-disc space-y-1 pl-5">
            @for (error of failure.fieldErrors; track $index) {
              <li>
                <code>{{ error.field }}</code>: {{ error.message }}
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class FormAlert {
  readonly failure = input<ApiFailure | null>(null);
}
