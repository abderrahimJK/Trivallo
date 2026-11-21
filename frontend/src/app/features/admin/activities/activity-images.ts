import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { catchError, concatMap, EMPTY, finalize, from, Observable } from 'rxjs';
import { sizedImageUrl } from '../../../core/media/image-sizes';
import { AdminWriteApi } from '../api/admin-api';
import { ActivityAdmin, AdminImage, MAX_ACTIVITY_IMAGES } from '../api/admin.models';
import { ApiFailure, toApiFailure } from '../api/api-errors';
import { FormAlert } from '../ui/form-alert';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Images of a saved activity: drop or choose several files, drag (or Up/Down) to reorder, the
 * first one is the cover, and a description per image (English required, French optional).
 * Every change is saved at once and the updated activity is handed back to the page.
 */
@Component({
  selector: 'trv-activity-images',
  imports: [FormAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-images.html',
})
export class ActivityImages {
  private readonly api = inject(AdminWriteApi);

  readonly activityId = input.required<number>();
  readonly images = input.required<AdminImage[]>();
  /** English title, to spot descriptions that only repeat it. */
  readonly activityTitle = input('');
  readonly changed = output<ActivityAdmin>();

  protected readonly max = MAX_ACTIVITY_IMAGES;
  protected readonly thumbnail = (url: string) => sizedImageUrl(url, 'sm');

  protected readonly busy = signal(false);
  protected readonly progress = signal<string | null>(null);
  protected readonly failure = signal<ApiFailure | null>(null);
  protected readonly skipped = signal<string[]>([]);
  protected readonly dropActive = signal(false);
  protected readonly dragIndex = signal<number | null>(null);
  protected readonly overIndex = signal<number | null>(null);
  /** Ids whose description was just saved, for a short "Saved" note. */
  protected readonly savedId = signal<number | null>(null);
  protected readonly missingEnglish = signal<Set<number>>(new Set());

  // ---- Upload ---------------------------------------------------------------------------

  protected onDragOver(event: DragEvent): void {
    if (this.dragIndex() !== null || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.dropActive.set(true);
  }

  protected onDrop(event: DragEvent): void {
    if (this.dragIndex() !== null) return;
    event.preventDefault();
    this.dropActive.set(false);
    this.upload(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onChoose(input: HTMLInputElement): void {
    this.upload(Array.from(input.files ?? []));
    input.value = '';
  }

  private upload(files: File[]): void {
    const skipped: string[] = [];
    const accepted = files.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        skipped.push(`${file.name}: not a JPEG or PNG image`);
        return false;
      }
      if (file.size > MAX_FILE_BYTES) {
        skipped.push(`${file.name}: larger than 10 MB`);
        return false;
      }
      return true;
    });
    const room = this.max - this.images().length;
    for (const file of accepted.splice(Math.max(0, room))) {
      skipped.push(`${file.name}: the limit is ${this.max} images`);
    }
    this.skipped.set(skipped);
    if (!accepted.length) return;

    // One at a time: the server resizes each image, and the order of the files is kept.
    // A file the server refuses is listed and skipped; the others still upload.
    let current = 0;
    this.busy.set(true);
    this.failure.set(null);
    this.progress.set(`Uploading 1 of ${accepted.length}…`);
    from(accepted)
      .pipe(
        concatMap((file) =>
          this.api.addImage(this.activityId(), file).pipe(
            catchError((error: unknown) => {
              const failure = toApiFailure(error);
              const detail =
                failure.fieldErrors.map((e) => e.message).join(', ') || failure.message;
              this.skipped.update((list) => [...list, `${file.name}: ${detail}`]);
              return EMPTY;
            }),
            finalize(() => {
              current++;
              this.progress.set(
                current < accepted.length
                  ? `Uploading ${current + 1} of ${accepted.length}…`
                  : null,
              );
            }),
          ),
        ),
      )
      .subscribe({
        next: (activity) => this.changed.emit(activity),
        complete: () => this.busy.set(false),
      });
  }

  // ---- Order ----------------------------------------------------------------------------

  protected onHandleDragStart(event: DragEvent, index: number, row: HTMLElement): void {
    this.dragIndex.set(index);
    event.dataTransfer?.setData('text/plain', String(index));
    event.dataTransfer?.setDragImage(row, 24, 24);
  }

  protected onRowDragOver(event: DragEvent, index: number): void {
    if (this.dragIndex() === null) return;
    event.preventDefault();
    this.overIndex.set(index);
  }

  protected onRowDrop(event: DragEvent, index: number): void {
    const from = this.dragIndex();
    if (from === null) return;
    event.preventDefault();
    this.endDrag();
    if (from !== index) this.saveOrder(moveItem(this.ids(), from, index));
  }

  protected endDrag(): void {
    this.dragIndex.set(null);
    this.overIndex.set(null);
  }

  protected move(index: number, offset: -1 | 1): void {
    this.saveOrder(moveItem(this.ids(), index, index + offset));
  }

  private saveOrder(ids: number[]): void {
    this.run(this.api.reorderImages(this.activityId(), ids));
  }

  private ids(): number[] {
    return this.images().map((image) => image.id);
  }

  // ---- Descriptions ---------------------------------------------------------------------

  protected saveText(image: AdminImage, english: HTMLInputElement, french: HTMLInputElement): void {
    const altText = english.value.trim();
    const altTextFr = french.value.trim() || null;
    const missing = new Set(this.missingEnglish());
    if (!altText) {
      missing.add(image.id);
      this.missingEnglish.set(missing);
      return;
    }
    missing.delete(image.id);
    this.missingEnglish.set(missing);
    if (altText === (image.altText ?? '') && altTextFr === image.altTextFr) return;
    this.run(this.api.updateImageText(this.activityId(), image.id, { altText, altTextFr }), () =>
      this.savedId.set(image.id),
    );
  }

  /** "MERZOUGA DUNES 3 DAYS" as the description of every photo tells a screen reader nothing. */
  protected repeatsTitle(value: string | null): boolean {
    const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
    return (
      !!value && !!this.activityTitle() && normalize(value) === normalize(this.activityTitle())
    );
  }

  // ---- Remove ---------------------------------------------------------------------------

  protected remove(image: AdminImage): void {
    // The files are deleted on the server and cannot be restored.
    if (!confirm('Remove this image? This cannot be undone.')) return;
    this.run(this.api.deleteImage(this.activityId(), image.id));
  }

  private run(request: Observable<ActivityAdmin>, onSuccess?: () => void): void {
    this.busy.set(true);
    this.failure.set(null);
    this.savedId.set(null);
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

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
