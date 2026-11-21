import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivityType, DayOfWeek } from '../../../core/api/catalog.models';
import {
  ActivityAdmin,
  ActivityAdminRequest,
  ActivityTranslation,
  Locale,
} from '../api/admin.models';
import { FormIssue } from '../ui/form-issues';
import {
  blankToNull,
  httpsUrl,
  linesToList,
  SLUG_PATTERN,
  validationMessage,
} from '../ui/form-utils';

export const WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

/**
 * The activity form, built with typed reactive forms. It mirrors ActivityAdminRequest but keeps
 * list fields as one-item-per-line text and the week as seven checkboxes, which are easier to edit.
 */
export function buildActivityForm(fb: FormBuilder) {
  const nn = fb.nonNullable;
  return nn.group(
    {
      slug: nn.control('', [
        Validators.required,
        Validators.pattern(SLUG_PATTERN),
        Validators.maxLength(160),
      ]),
      citySlug: nn.control('', Validators.required),
      categorySlug: nn.control('', Validators.required),
      type: nn.control<ActivityType>('EXCURSION', Validators.required),
      priceAdultEur: fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      priceChildEur: fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      durationMinutes: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(15),
        Validators.max(20160),
      ]),
      maxGroupSize: fb.control<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(200),
      ]),
      operatingDays: nn.group(
        Object.fromEntries(WEEK.map((day) => [day, nn.control(true)])) as Record<
          DayOfWeek,
          ReturnType<typeof nn.control<boolean>>
        >,
        { validators: atLeastOneDay },
      ),
      meetingPoint: nn.control('', Validators.maxLength(255)),
      latitude: fb.control<number | null>(null, [Validators.min(-90), Validators.max(90)]),
      longitude: fb.control<number | null>(null, [Validators.min(-180), Validators.max(180)]),
      tripadvisorUrl: nn.control('', [httpsUrl, Validators.maxLength(500)]),
      en: buildTranslationGroup(fb, true),
      fr: buildTranslationGroup(fb, false),
    },
    { validators: [childNotAboveAdult, coordinatesInPairs] },
  );
}

export type ActivityForm = ReturnType<typeof buildActivityForm>;

function buildTranslationGroup(fb: FormBuilder, required: boolean) {
  const nn = fb.nonNullable;
  return nn.group({
    title: nn.control(
      '',
      required ? [Validators.required, Validators.maxLength(200)] : Validators.maxLength(200),
    ),
    summary: nn.control('', Validators.maxLength(500)),
    description: nn.control('', Validators.maxLength(10000)),
    itinerary: nn.control('', Validators.maxLength(10000)),
    included: nn.control(''),
    notIncluded: nn.control(''),
    metaTitle: nn.control('', Validators.maxLength(120)),
    metaDescription: nn.control('', Validators.maxLength(320)),
  });
}

type TranslationGroup = ReturnType<typeof buildTranslationGroup>;

/** Same rule as the backend's ActivityRules: a child never pays more than an adult. */
export function childNotAboveAdult(group: AbstractControl): ValidationErrors | null {
  const adult = group.get('priceAdultEur')?.value as number | null;
  const child = group.get('priceChildEur')?.value as number | null;
  return adult != null && child != null && child > adult ? { childAboveAdult: true } : null;
}

export function coordinatesInPairs(group: AbstractControl): ValidationErrors | null {
  const lat = group.get('latitude')?.value;
  const lng = group.get('longitude')?.value;
  return (lat == null) !== (lng == null) ? { coordinatesPair: true } : null;
}

function atLeastOneDay(group: AbstractControl): ValidationErrors | null {
  return Object.values(group.value).some(Boolean) ? null : { noDay: true };
}

/** Labels of the translated texts, in page order. */
const TEXT_LABELS: Record<keyof TranslationGroup['controls'], string> = {
  title: 'Title',
  summary: 'Summary',
  description: 'Description',
  itinerary: 'Itinerary',
  included: 'Included',
  notIncluded: 'Not included',
  metaTitle: 'Meta title',
  metaDescription: 'Meta description',
};

/** Labels of the other fields, in page order. */
const DETAIL_LABELS: Partial<Record<keyof ActivityForm['controls'], string>> = {
  citySlug: 'City',
  categorySlug: 'Category',
  type: 'Type',
  slug: 'URL slug',
  priceAdultEur: 'Adult price',
  priceChildEur: 'Child price',
  durationMinutes: 'Duration',
  maxGroupSize: 'Maximum group size',
  operatingDays: 'Runs on',
  meetingPoint: 'Meeting point',
  latitude: 'Latitude',
  longitude: 'Longitude',
  tripadvisorUrl: 'TripAdvisor link',
};

/** Element id of a field, shared by the template and the error summary. */
export function activityFieldId(name: string, language?: Locale): string {
  return language ? `activity-${language}-${name}` : `activity-${name}`;
}

/** Every rule the form currently breaks, in page order: texts (English, then French), then details. */
export function activityFormIssues(form: ActivityForm): FormIssue[] {
  const issues: FormIssue[] = [];
  for (const language of ['en', 'fr'] as const) {
    for (const [name, label] of Object.entries(TEXT_LABELS)) {
      const control = form.controls[language].get(name);
      if (control?.invalid) {
        const message = validationMessage(control.errors);
        issues.push({ fieldId: activityFieldId(name, language), label, message, language });
      }
    }
  }
  for (const [name, label] of Object.entries(DETAIL_LABELS)) {
    const control = form.get(name);
    if (control?.invalid) {
      issues.push({
        fieldId: activityFieldId(name),
        label,
        message: validationMessage(control.errors),
      });
    }
  }
  if (form.hasError('childAboveAdult')) {
    issues.push({
      fieldId: activityFieldId('priceChildEur'),
      label: 'Child price',
      message: 'Cannot be higher than the adult price.',
    });
  }
  if (form.hasError('coordinatesPair')) {
    issues.push({
      fieldId: activityFieldId('latitude'),
      label: 'Latitude and longitude',
      message: 'Fill in both, or neither.',
    });
  }
  return issues;
}

/** Form value -> request body. French is sent only once it has a title; English is required. */
export function toActivityRequest(form: ActivityForm): ActivityAdminRequest {
  const v = form.getRawValue();
  const translations = [toTranslation('en', v.en)];
  if (v.fr.title.trim()) {
    translations.push(toTranslation('fr', v.fr));
  }
  return {
    slug: v.slug.trim(),
    citySlug: v.citySlug,
    categorySlug: v.categorySlug,
    type: v.type,
    priceAdultEur: v.priceAdultEur ?? 0,
    priceChildEur: v.priceChildEur ?? 0,
    durationMinutes: v.durationMinutes ?? 0,
    maxGroupSize: v.maxGroupSize ?? 0,
    operatingDays: WEEK.filter((day) => v.operatingDays[day]),
    meetingPoint: blankToNull(v.meetingPoint),
    latitude: v.latitude,
    longitude: v.longitude,
    tripadvisorUrl: blankToNull(v.tripadvisorUrl),
    translations,
  };
}

function toTranslation(locale: Locale, t: TranslationGroup['value'] & {}): ActivityTranslation {
  return {
    locale,
    title: (t.title ?? '').trim(),
    summary: blankToNull(t.summary),
    description: blankToNull(t.description),
    itinerary: blankToNull(t.itinerary),
    included: linesToList(t.included),
    notIncluded: linesToList(t.notIncluded),
    metaTitle: blankToNull(t.metaTitle),
    metaDescription: blankToNull(t.metaDescription),
  };
}

/** Saved activity -> form value (the inverse of toActivityRequest). */
export function patchActivityForm(form: ActivityForm, activity: ActivityAdmin): void {
  const translation = (locale: Locale) => {
    const t = activity.translations.find((item) => item.locale === locale);
    return {
      title: t?.title ?? '',
      summary: t?.summary ?? '',
      description: t?.description ?? '',
      itinerary: t?.itinerary ?? '',
      included: (t?.included ?? []).join('\n'),
      notIncluded: (t?.notIncluded ?? []).join('\n'),
      metaTitle: t?.metaTitle ?? '',
      metaDescription: t?.metaDescription ?? '',
    };
  };
  form.reset({
    slug: activity.slug,
    citySlug: activity.citySlug,
    categorySlug: activity.categorySlug,
    type: activity.type,
    priceAdultEur: activity.priceAdultEur,
    priceChildEur: activity.priceChildEur,
    durationMinutes: activity.durationMinutes,
    maxGroupSize: activity.maxGroupSize,
    operatingDays: Object.fromEntries(
      WEEK.map((day) => [day, activity.operatingDays.includes(day)]),
    ) as Record<DayOfWeek, boolean>,
    meetingPoint: activity.meetingPoint ?? '',
    latitude: activity.latitude,
    longitude: activity.longitude,
    tripadvisorUrl: activity.tripadvisorUrl ?? '',
    en: translation('en'),
    fr: translation('fr'),
  });
}
