import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Locale } from '../api/admin.models';

/** One invalid field, as listed in the summary above the save button. */
export interface FormIssue {
  /** Id of the input, select or fieldset, so the summary can jump to it. */
  fieldId: string;
  label: string;
  message: string;
  /** Set for translated texts, which sit on a language tab. */
  language?: Locale;
}

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', fr: 'French' };

/** Client-side summary of what blocks a save. Each entry jumps to its field. */
@Component({
  selector: 'trv-form-issues',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (issues().length) {
      <div
        role="alert"
        class="max-h-[40vh] overflow-y-auto rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900"
      >
        <p class="font-semibold">{{ heading() }}</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          @for (issue of issues(); track issue.fieldId + issue.message) {
            <li>
              <button
                type="button"
                class="font-semibold underline underline-offset-2 hover:no-underline"
                (click)="selected.emit(issue)"
              >
                {{ issue.label }}
                @if (issue.language) {
                  ({{ languageNames[issue.language] }})
                }</button
              >: {{ issue.message }}
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class FormIssues {
  readonly issues = input.required<FormIssue[]>();
  readonly selected = output<FormIssue>();

  protected readonly languageNames = LANGUAGE_NAMES;
  protected readonly heading = computed(() => {
    const count = this.issues().length;
    return count === 1
      ? '1 field needs fixing before you can save:'
      : `${count} fields need fixing before you can save:`;
  });
}
