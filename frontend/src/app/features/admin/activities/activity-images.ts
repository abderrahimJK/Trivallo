import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminWriteApi } from '../api/admin-api';
import { ActivityAdmin, AdminImage } from '../api/admin.models';
import { ApiFailure, toApiFailure } from '../api/api-errors';
import { FormAlert } from '../ui/form-alert';

/**
 * Photos of a saved activity: upload, reorder (the first one is the cover), delete.
 * Each change is saved immediately and the updated activity is handed back to the page.
 */
@Component({
  selector: 'trv-activity-images',
  imports: [FormAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="rounded-xl border border-border bg-background p-5"
      aria-labelledby="photos-title"
    >
      <h2 id="photos-title" class="text-lg font-bold">Photos</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        JPG, PNG or WEBP, up to 5 MB. The first photo is the cover on cards and search results.
      </p>

      @if (images().length) {
        <ol class="mt-4 space-y-3">
          @for (image of images(); track image.id; let i = $index, last = $last) {
            <li class="flex gap-3 rounded-lg border border-border p-2">
              <img
                [src]="image.url"
                [alt]="image.altText ?? ''"
                class="aspect-[4/3] w-28 shrink-0 rounded-md object-cover"
              />
              <div class="flex min-w-0 flex-1 flex-col justify-between gap-1 text-sm">
                <p class="min-w-0">
                  @if (i === 0) {
                    <span class="tag mb-1 bg-secondary text-on-secondary">Cover</span>
                  }
                  <span class="line-clamp-2 block text-muted-foreground">{{
                    image.altText || 'No description'
                  }}</span>
                </p>
                <span class="flex gap-1">
                  <button
                    type="button"
                    class="min-h-9 rounded-md px-2 hover:bg-muted disabled:opacity-40"
                    [disabled]="busy() || i === 0"
                    (click)="move(i, -1)"
                    [attr.aria-label]="'Move photo ' + (i + 1) + ' earlier'"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    class="min-h-9 rounded-md px-2 hover:bg-muted disabled:opacity-40"
                    [disabled]="busy() || last"
                    (click)="move(i, 1)"
                    [attr.aria-label]="'Move photo ' + (i + 1) + ' later'"
                  >
                    &darr;
                  </button>
                  <button
                    type="button"
                    class="ml-auto min-h-9 rounded-md px-2 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    [disabled]="busy()"
                    (click)="remove(image)"
                  >
                    Delete
                  </button>
                </span>
              </div>
            </li>
          }
        </ol>
      } @else {
        <p class="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          No photos yet. Activities without photos show a plain placeholder on the site.
        </p>
      }

      <form
        class="mt-5 grid gap-3 border-t border-border pt-4"
        (submit)="upload($event, fileInput, altInput)"
      >
        <label>
          <span class="field-label">Photo</span>
          <input
            #fileInput
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="field py-2"
            required
          />
        </label>
        <label>
          <span class="field-label">Description (alt text)</span>
          <input
            #altInput
            type="text"
            maxlength="200"
            class="field"
            placeholder="Camels at sunset in the dunes"
          />
        </label>
        <button type="submit" class="btn-outline" [disabled]="busy()">
          {{ busy() ? 'Saving…' : 'Upload' }}
        </button>
      </form>
      <div class="mt-3"><trv-form-alert [failure]="failure()" /></div>
    </section>
  `,
})
export class ActivityImages {
  private readonly api = inject(AdminWriteApi);

  readonly activityId = input.required<number>();
  readonly images = input.required<AdminImage[]>();
  readonly changed = output<ActivityAdmin>();

  protected readonly busy = signal(false);
  protected readonly failure = signal<ApiFailure | null>(null);

  protected upload(event: Event, fileInput: HTMLInputElement, altInput: HTMLInputElement): void {
    event.preventDefault();
    const file = fileInput.files?.[0];
    if (!file) return;
    this.run(this.api.addImage(this.activityId(), file, altInput.value), () => {
      fileInput.value = '';
      altInput.value = '';
    });
  }

  protected move(index: number, offset: -1 | 1): void {
    const ids = this.images().map((image) => image.id);
    [ids[index], ids[index + offset]] = [ids[index + offset], ids[index]];
    this.run(this.api.reorderImages(this.activityId(), ids));
  }

  protected remove(image: AdminImage): void {
    // A native confirm keeps this simple; the file is deleted on the server and cannot be restored.
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    this.run(this.api.deleteImage(this.activityId(), image.id));
  }

  private run(request: Observable<ActivityAdmin>, onSuccess?: () => void): void {
    this.busy.set(true);
    this.failure.set(null);
    request.subscribe({
      next: (activity) => {
        this.busy.set(false);
        onSuccess?.();
        this.changed.emit(activity);
      },
      error: (error: unknown) => {
        this.busy.set(false);
        this.failure.set(toApiFailure(error));
      },
    });
  }
}
