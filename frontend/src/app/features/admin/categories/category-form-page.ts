import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { adminApi, AdminWriteApi } from '../api/admin-api';
import { CategoryAdmin, CategoryAdminRequest, CategoryTranslation } from '../api/admin.models';
import { ApiFailure, toApiFailure } from '../api/api-errors';
import { FieldError } from '../ui/field-error';
import { FormAlert } from '../ui/form-alert';
import { blankToNull, slugify, slugValidators } from '../ui/form-utils';
import { AdminPageHeader } from '../ui/page-header';

/** Create or edit a category ("way to travel"), e.g. Desert tours or Quad and buggy. */
@Component({
  selector: 'trv-category-form-page',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeader, FieldError, FormAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <trv-admin-page-header
      [title]="heading()"
      backLink="/admin/categories"
      backLabel="All categories"
    />

    @if (notFound()) {
      <p role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
        This category does not exist.
        <a routerLink="/admin/categories" class="link">Back to the list</a>
      </p>
    } @else {
      <form [formGroup]="form" (ngSubmit)="save()" class="max-w-2xl space-y-6" novalidate>
        <section
          class="grid gap-4 rounded-xl border border-border bg-background p-5 md:grid-cols-2"
        >
          <label>
            <span class="field-label">English name *</span>
            <input class="field" formControlName="nameEn" maxlength="120" />
            <trv-field-error [control]="form.controls.nameEn" />
          </label>
          <label>
            <span class="field-label">French name</span>
            <input class="field" formControlName="nameFr" maxlength="120" />
            <span class="text-xs text-muted-foreground"
              >Optional; the French site falls back to English.</span
            >
          </label>
          <label>
            <span class="field-label">URL slug *</span>
            <input class="field font-mono text-sm" formControlName="slug" maxlength="80" />
            <span class="text-xs text-muted-foreground"
              >Used in filters: /activities?category={{ form.controls.slug.value || '…' }}</span
            >
            <trv-field-error [control]="form.controls.slug" />
          </label>
          <label>
            <span class="field-label">Order in menus *</span>
            <input class="field" type="number" min="0" max="1000" formControlName="sortOrder" />
            <trv-field-error [control]="form.controls.sortOrder" />
          </label>
          <label class="md:col-span-2">
            <span class="field-label">Icon name</span>
            <input class="field font-mono text-sm" formControlName="icon" maxlength="60" />
            <span class="text-xs text-muted-foreground"
              >Optional, lowercase with hyphens (e.g. "camel").</span
            >
            <trv-field-error [control]="form.controls.icon" />
          </label>
        </section>
        <div class="space-y-3">
          <trv-form-alert [failure]="failure()" />
          @if (notice()) {
            <p role="status" class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
              {{ notice() }}
            </p>
          }
          <button type="submit" class="btn-cta" [disabled]="saving()">
            {{ saving() ? 'Saving…' : isNew() ? 'Create category' : 'Save changes' }}
          </button>
        </div>
      </form>
    }
  `,
})
export class CategoryFormPage {
  private readonly api = inject(AdminWriteApi);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly id = input<string>();

  protected readonly form = this.fb.group({
    nameEn: this.fb.control('', [Validators.required, Validators.maxLength(120)]),
    nameFr: this.fb.control('', Validators.maxLength(120)),
    slug: this.fb.control('', slugValidators),
    sortOrder: this.fb.control(0, [Validators.required, Validators.min(0), Validators.max(1000)]),
    icon: this.fb.control('', [Validators.pattern(/^[a-z0-9-]*$/), Validators.maxLength(60)]),
  });

  private readonly categoryId = computed(() => (this.id() ? Number(this.id()) : null));
  protected readonly isNew = computed(() => this.categoryId() === null);
  private readonly all = httpResource<CategoryAdmin[]>(() =>
    this.isNew() ? undefined : adminApi.categories(),
  );
  private readonly category = computed(() =>
    this.all.value()?.find((c) => c.id === this.categoryId()),
  );
  protected readonly notFound = computed(
    () => !this.isNew() && this.all.hasValue() && !this.category(),
  );
  protected readonly heading = signal('New category');

  protected readonly saving = signal(false);
  protected readonly failure = signal<ApiFailure | null>(null);
  protected readonly notice = signal<string | null>(null);

  constructor() {
    effect(() => {
      const category = this.category();
      if (category) this.patch(category);
    });
    this.form.controls.nameEn.valueChanges.pipe(takeUntilDestroyed()).subscribe((name) => {
      if (this.isNew() && !this.form.controls.slug.dirty)
        this.form.controls.slug.setValue(slugify(name).slice(0, 80));
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const id = this.categoryId();
    const body = this.toRequest();
    const request: Observable<CategoryAdmin> = id
      ? this.api.updateCategory(id, body)
      : this.api.createCategory(body);
    this.saving.set(true);
    this.failure.set(null);
    this.notice.set(null);
    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        if (id) {
          this.patch(saved);
          this.notice.set('Changes saved.');
        } else {
          void this.router.navigate(['/admin/categories']);
        }
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(toApiFailure(error));
      },
    });
  }

  private patch(category: CategoryAdmin): void {
    const name = (locale: string) =>
      category.translations.find((t) => t.locale === locale)?.name ?? '';
    this.heading.set(name('en') || category.slug);
    this.form.reset({
      nameEn: name('en'),
      nameFr: name('fr'),
      slug: category.slug,
      sortOrder: category.sortOrder,
      icon: category.icon ?? '',
    });
  }

  private toRequest(): CategoryAdminRequest {
    const v = this.form.getRawValue();
    const translations: CategoryTranslation[] = [{ locale: 'en', name: v.nameEn.trim() }];
    if (v.nameFr.trim()) translations.push({ locale: 'fr', name: v.nameFr.trim() });
    return { slug: v.slug.trim(), icon: blankToNull(v.icon), sortOrder: v.sortOrder, translations };
  }
}
