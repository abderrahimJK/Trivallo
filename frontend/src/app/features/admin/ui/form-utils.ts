import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const slugValidators = [
  Validators.required,
  Validators.pattern(SLUG_PATTERN),
  Validators.maxLength(80),
];

/** Lowercase, hyphenated slug from a title: "Sunset Quad Ride" -> "sunset-quad-ride". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function httpsUrl(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  return !value || value.startsWith('https://') ? null : { https: true };
}

/** Empty strings become null, so optional columns are cleared rather than set to "". */
export function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** One item per non-empty line (textarea <-> list of strings). */
export function linesToList(text: string | null | undefined): string[] {
  return (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Plain-English text for a control's validation error, used inline and in the form's summary. */
export function validationMessage(errors: ValidationErrors | null): string {
  if (!errors) return '';
  if (errors['required']) return 'Required.';
  if (errors['pattern']) return 'Use lowercase letters, digits and hyphens.';
  if (errors['maxlength']) return `At most ${errors['maxlength'].requiredLength} characters.`;
  if (errors['min']) return `Must be at least ${errors['min'].min}.`;
  if (errors['max']) return `Must be at most ${errors['max'].max}.`;
  if (errors['https']) return 'Must be an https:// link.';
  if (errors['noDay']) return 'Pick at least one day.';
  return 'Invalid value.';
}
