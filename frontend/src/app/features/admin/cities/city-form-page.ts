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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { sizedImageUrl } from '../../../core/media/image-sizes';
import { adminApi, AdminWriteApi } from '../api/admin-api';
import {
  CityAdmin,
  CityAdminRequest,
  CityTranslation,
  englishName,
  Locale,
} from '../api/admin.models';
import { ApiFailure, toApiFailure } from '../api/api-errors';
import { FieldError } from '../ui/field-error';
import { FormAlert } from '../ui/form-alert';
import { blankToNull, slugValidators } from '../ui/form-utils';
import { AdminPageHeader } from '../ui/page-header';

/** Create or edit a city (destination). The hero photo can be replaced once the city exists. */
@Component({
  selector: 'trv-city-form-page',
  imports: [ReactiveFormsModule, RouterLink, AdminPageHeader, FieldError, FormAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <trv-admin-page-header [title]="heading()" backLink="/admin/cities" backLabel="All cities">
      @if (city(); as c) {
        <a [routerLink]="['/cities', c.slug]" class="link text-sm">View on site</a>
      }
    </trv-admin-page-header>

    @if (notFound()) {
      <p role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
        This city does not exist. <a routerLink="/admin/cities" class="link">Back to the list</a>
      </p>
    } @else {
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6" novalidate>
          <section class="rounded-xl border border-border bg-background p-5">
            <div class="grid gap-4 md:grid-cols-2">
              <label>
                <span class="field-label">URL slug *</span>
                <input class="field font-mono text-sm" formControlName="slug" maxlength="80" />
                <span class="text-xs text-muted-foreground"
                  >Page address: /cities/{{ form.controls.slug.value || '…' }}</span
                >
                <trv-field-error [control]="form.controls.slug" />
              </label>
              <label>
                <span class="field-label">Order in menus *</span>
                <input class="field" type="number" min="0" max="1000" formControlName="sortOrder" />
                <span class="text-xs text-muted-foreground">Lower numbers come first.</span>
                <trv-field-error [control]="form.controls.sortOrder" />
              </label>
            </div>
          </section>

          @for (lang of languages; track lang.code) {
            <section
              class="rounded-xl border border-border bg-background p-5"
              [formGroupName]="lang.code"
            >
              <h2 class="text-lg font-bold">{{ lang.label }}</h2>
              @if (lang.code === 'fr') {
                <p class="mt-1 text-sm text-muted-foreground">
                  Optional. Without a French name, the French site shows the English text.
                </p>
              }
              <div class="mt-4 grid gap-4">
                <label>
                  <span class="field-label"
                    >Name
                    @if (lang.code === 'en') {
                      *
                    }
                  </span>
                  <input class="field" formControlName="name" maxlength="120" />
                  <trv-field-error [control]="form.get(lang.code + '.name')!" />
                </label>
                <label>
                  <span class="field-label">Description</span>
                  <textarea
                    class="field py-2"
                    rows="4"
                    formControlName="description"
                    maxlength="2000"
                  ></textarea>
                </label>
                <div class="grid gap-4 md:grid-cols-2">
                  <label>
                    <span class="field-label">Meta title</span>
                    <input class="field" formControlName="metaTitle" maxlength="120" />
                  </label>
                  <label>
                    <span class="field-label">Meta description</span>
                    <input class="field" formControlName="metaDescription" maxlength="320" />
                  </label>
                </div>
              </div>
            </section>
          }

          <div class="space-y-3">
            <trv-form-alert [failure]="failure()" />
            @if (notice()) {
              <p role="status" class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                {{ notice() }}
              </p>
            }
            <button type="submit" class="btn-cta" [disabled]="saving()">
              {{ saving() ? 'Saving…' : isNew() ? 'Create city' : 'Save changes' }}
            </button>
          </div>
        </form>

        <aside>
          <section class="rounded-xl border border-border bg-background p-5">
            <h2 class="text-lg font-bold">Hero photo</h2>
            @if (city(); as c) {
              @if (c.heroImageUrl) {
                <img
                  [src]="medium(c.heroImageUrl)"
                  alt=""
                  class="mt-3 aspect-[16/9] w-full rounded-lg object-cover"
                />
              } @else {
                <p class="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  No hero photo yet.
                </p>
              }
              <form class="mt-4 space-y-3" (submit)="uploadHero($event, heroInput)">
                <label class="block">
                  <span class="field-label">{{
                    c.heroImageUrl ? 'Replace photo' : 'Upload photo'
                  }}</span>
                  <input
                    #heroInput
                    type="file"
                    accept="image/jpeg,image/png"
                    class="field py-2"
                    required
                  />
                </label>
                <p class="text-xs text-muted-foreground">
                  JPEG or PNG, up to 10 MB, resized automatically. Wide photos work best.
                </p>
                <button type="submit" class="btn-outline" [disabled]="saving()">Upload</button>
              </form>
            } @else {
              <p class="mt-2 text-sm text-muted-foreground">
                Create the city first, then add its photo here.
              </p>
            }
          </section>
        </aside>
      </div>
    }
  `,
})
export class CityFormPage {
  private readonly api = inject(AdminWriteApi);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly id = input<string>();
  protected readonly medium = (url: string) => sizedImageUrl(url, 'md');

  protected readonly languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
  ];

  protected readonly form = this.fb.group({
    slug: this.fb.control('', slugValidators),
    sortOrder: this.fb.control(0, [Validators.required, Validators.min(0), Validators.max(1000)]),
    en: this.translationGroup(true),
    fr: this.translationGroup(false),
  });

  private readonly cityId = computed(() => (this.id() ? Number(this.id()) : null));
  protected readonly isNew = computed(() => this.cityId() === null);

  /** There is no GET-by-id for cities; the admin list is small, so the city is picked from it. */
  private readonly all = httpResource<CityAdmin[]>(() =>
    this.isNew() ? undefined : adminApi.cities(),
  );
  protected readonly city = linkedSignal(() =>
    this.all.value()?.find((c) => c.id === this.cityId()),
  );
  protected readonly notFound = computed(
    () => !this.isNew() && this.all.hasValue() && !this.city(),
  );
  protected readonly heading = computed(() => {
    const city = this.city();
    return city ? englishName(city) : this.isNew() ? 'New city' : 'Edit city';
  });

  protected readonly saving = signal(false);
  protected readonly failure = signal<ApiFailure | null>(null);
  protected readonly notice = signal<string | null>(
    (this.router.currentNavigation()?.extras.state?.['notice'] as string | undefined) ?? null,
  );

  constructor() {
    effect(() => {
      const city = this.all.value()?.find((c) => c.id === this.cityId());
      if (city) this.patch(city);
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const id = this.cityId();
    const body = this.toRequest();
    if (id) {
      this.submit(this.api.updateCity(id, body), () => 'Changes saved.');
    } else {
      this.submit(this.api.createCity(body), (saved) => {
        const notice = 'City created. You can add its hero photo now.';
        void this.router.navigate(['/admin/cities', saved.id], {
          replaceUrl: true,
          state: { notice },
        });
        return notice;
      });
    }
  }

  protected uploadHero(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const id = this.cityId();
    const file = input.files?.[0];
    if (!id || !file) return;
    this.submit(this.api.replaceCityHero(id, file), () => {
      input.value = '';
      return 'Hero photo updated.';
    });
  }

  private submit(request: Observable<CityAdmin>, onSuccess: (saved: CityAdmin) => string): void {
    this.saving.set(true);
    this.failure.set(null);
    this.notice.set(null);
    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.city.set(saved);
        this.patch(saved);
        this.notice.set(onSuccess(saved));
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(toApiFailure(error));
      },
    });
  }

  private translationGroup(required: boolean) {
    return this.fb.group({
      name: this.fb.control(
        '',
        required ? [Validators.required, Validators.maxLength(120)] : Validators.maxLength(120),
      ),
      description: this.fb.control(''),
      metaTitle: this.fb.control(''),
      metaDescription: this.fb.control(''),
    });
  }

  private patch(city: CityAdmin): void {
    const t = (locale: Locale) => {
      const found = city.translations.find((item) => item.locale === locale);
      return {
        name: found?.name ?? '',
        description: found?.description ?? '',
        metaTitle: found?.metaTitle ?? '',
        metaDescription: found?.metaDescription ?? '',
      };
    };
    this.form.reset({ slug: city.slug, sortOrder: city.sortOrder, en: t('en'), fr: t('fr') });
  }

  private toRequest(): CityAdminRequest {
    const v = this.form.getRawValue();
    const translation = (locale: Locale, t: typeof v.en): CityTranslation => ({
      locale,
      name: t.name.trim(),
      description: blankToNull(t.description),
      metaTitle: blankToNull(t.metaTitle),
      metaDescription: blankToNull(t.metaDescription),
    });
    const translations = [translation('en', v.en)];
    if (v.fr.name.trim()) translations.push(translation('fr', v.fr));
    return { slug: v.slug.trim(), sortOrder: v.sortOrder, translations };
  }
}
