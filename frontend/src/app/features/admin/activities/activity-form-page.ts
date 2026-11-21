import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { adminApi, AdminWriteApi } from '../api/admin-api';
import {
  ActivityAdmin,
  ActivityStatus,
  CategoryAdmin,
  CityAdmin,
  englishName,
  Locale,
} from '../api/admin.models';
import { ApiFailure, toApiFailure } from '../api/api-errors';
import { FieldError } from '../ui/field-error';
import { FormAlert } from '../ui/form-alert';
import { slugify } from '../ui/form-utils';
import { AdminPageHeader } from '../ui/page-header';
import { StatusBadge } from '../ui/status-badge';
import { ActivityImages } from './activity-images';
import {
  buildActivityForm,
  patchActivityForm,
  toActivityRequest,
  WEEK,
} from './activity-form.model';

/**
 * Create (/admin/activities/new) or edit (/admin/activities/:id) an activity.
 * New activities start as drafts; photos can be added once the activity is saved.
 */
@Component({
  selector: 'trv-activity-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AdminPageHeader,
    FieldError,
    FormAlert,
    StatusBadge,
    ActivityImages,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-form-page.html',
})
export class ActivityFormPage {
  private readonly api = inject(AdminWriteApi);
  private readonly router = inject(Router);

  /** Route param; absent on /new. */
  readonly id = input<string>();

  protected readonly activityId = computed(() => {
    const id = Number(this.id());
    return Number.isInteger(id) && id > 0 ? id : null;
  });
  protected readonly isNew = computed(() => this.activityId() === null);

  protected readonly form = buildActivityForm(inject(FormBuilder));
  protected readonly week = WEEK;
  protected readonly cityName = englishName;
  protected readonly language = signal<Locale>('en');

  protected readonly cities = httpResource<CityAdmin[]>(() => adminApi.cities());
  protected readonly categories = httpResource<CategoryAdmin[]>(() => adminApi.categories());
  private readonly loaded = httpResource<ActivityAdmin>(() => {
    const id = this.activityId();
    return id ? adminApi.activity(id) : undefined;
  });
  /** Latest saved state: from the load, then replaced by every save, status change or photo change. */
  protected readonly activity = linkedSignal<ActivityAdmin | undefined>(() => this.loaded.value());
  protected readonly heading = computed(() => {
    if (this.isNew()) return 'New activity';
    return this.activity()?.translations.find((t) => t.locale === 'en')?.title ?? 'Edit activity';
  });
  protected readonly loadFailed = computed(() => !!this.loaded.error());

  protected readonly saving = signal(false);
  protected readonly failure = signal<ApiFailure | null>(null);
  /** Success message; after "create" it arrives through the navigation to the edit URL. */
  protected readonly notice = signal<string | null>(
    (this.router.currentNavigation()?.extras.state?.['notice'] as string | undefined) ?? null,
  );

  constructor() {
    effect(() => {
      const loaded = this.loaded.value();
      if (loaded) patchActivityForm(this.form, loaded);
    });

    // On a new activity, the slug follows the English title until it is edited by hand.
    this.form.controls.en.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((title) => {
        const slug = this.form.controls.slug;
        if (this.isNew() && !slug.dirty) slug.setValue(slugify(title).slice(0, 160));
      });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.failure.set({
        message: 'Some fields need attention (check both languages).',
        fieldErrors: [],
      });
      return;
    }
    const body = toActivityRequest(this.form);
    const id = this.activityId();
    if (id) {
      this.submit(this.api.updateActivity(id, body), () => 'Changes saved.');
      return;
    }
    this.submit(this.api.createActivity(body), (saved) => {
      const notice = 'Draft created. You can add photos now.';
      void this.router.navigate(['/admin/activities', saved.id], {
        replaceUrl: true,
        state: { notice },
      });
      return notice;
    });
  }

  protected setStatus(status: ActivityStatus): void {
    const id = this.activityId();
    if (!id) return;
    if (
      this.form.dirty &&
      !confirm('You have unsaved changes. Change the status without saving them?')
    )
      return;
    const messages: Record<ActivityStatus, string> = {
      PUBLISHED: 'Published: the activity is now visible on the site.',
      DRAFT: 'Moved back to draft: the activity is hidden from the site.',
      ARCHIVED: 'Archived: the activity is hidden from the site.',
    };
    this.submit(this.api.changeStatus(id, status), () => messages[status]);
  }

  protected onImagesChanged(activity: ActivityAdmin): void {
    this.activity.set(activity);
  }

  protected hasError(controlPath: string, error: string): boolean {
    const control = this.form.get(controlPath);
    return !!control?.hasError(error) && (control.touched || control.dirty);
  }

  private submit(
    request: Observable<ActivityAdmin>,
    onSuccess: (saved: ActivityAdmin) => string,
  ): void {
    this.saving.set(true);
    this.failure.set(null);
    this.notice.set(null);
    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.activity.set(saved);
        patchActivityForm(this.form, saved);
        this.notice.set(onSuccess(saved));
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(toApiFailure(error));
      },
    });
  }
}
