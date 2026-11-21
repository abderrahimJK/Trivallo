import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { IMAGE_WIDTHS } from '../../core/media/image-sizes';
import { cityTone } from './city-chapter';
import { Icon } from './icon';

/**
 * Fills its host (sized by the parent: aspect ratio or absolute inset) with an optimized image.
 * Until real photos are uploaded, or when one fails to load, it shows a soft city-tinted panel
 * with the category icon instead of a generic stock photo.
 */
@Component({
  selector: 'trv-media-frame',
  imports: [NgOptimizedImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block overflow-hidden' },
  template: `
    @if (visibleSrc(); as url) {
      <img
        #image
        [ngSrc]="url"
        [alt]="alt()"
        fill
        [ngSrcset]="srcset"
        [sizes]="sizes()"
        [priority]="priority()"
        class="object-cover transition-transform duration-300 group-hover:scale-105"
        (error)="visibleSrc.set(null)"
      />
    } @else {
      <div class="absolute inset-0 flex items-center justify-center" [class]="tone().tint">
        <trv-icon
          [name]="icon()"
          class="size-1/4 max-h-24 max-w-24 opacity-80 transition-transform duration-300 group-hover:scale-110"
          [class]="tone().ink"
        />
      </div>
    }
  `,
})
export class MediaFrame {
  readonly src = input<string | null>(null);
  readonly alt = input('');
  readonly icon = input('dune');
  /** City slug: picks the placeholder tint. */
  readonly city = input<string | null>(null);
  /** Above-the-fold images: loaded eagerly with high fetch priority. */
  readonly priority = input(false);
  /** Pixel widths are fine (e.g. "(min-width: 640px) 280px, 100vw") because the srcset is explicit. */
  readonly sizes = input('(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw');

  /**
   * The three widths the backend stores, so the browser picks among real files. Angular's automatic
   * srcset would give the same list but rejects pixel values in sizes (NG02952).
   */
  protected readonly srcset = Object.values(IMAGE_WIDTHS)
    .map((width) => `${width}w`)
    .join(', ');

  protected readonly tone = computed(() => cityTone(this.city()));

  /** Falls back to the placeholder when the image fails to load (missing file, bad URL). */
  protected readonly visibleSrc = linkedSignal(() => this.src());

  private readonly image = viewChild<ElementRef<HTMLImageElement>>('image');

  constructor() {
    // A server-rendered <img> can fail before hydration attaches the (error) listener; catch that case once.
    afterNextRender(() => {
      const element = this.image()?.nativeElement;
      if (element?.complete && element.naturalWidth === 0) {
        this.visibleSrc.set(null);
      }
    });
  }
}
