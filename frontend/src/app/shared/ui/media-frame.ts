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
import { cityChapter } from './city-chapter';
import { Dunes } from './dunes';
import { Icon } from './icon';

/**
 * Fills its (positioned) host with an optimized image. Until real photos are uploaded, or when
 * one fails to load, it shows the city's chapter gradient with dunes and the category icon,
 * so layouts look finished without stock photos (MASTER.md anti-pattern: generic photos).
 */
@Component({
  selector: 'trv-media-frame',
  imports: [NgOptimizedImage, Dunes, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block overflow-hidden' },
  template: `
    @if (visibleSrc(); as url) {
      <img
        #image
        [ngSrc]="url"
        [alt]="alt()"
        fill
        [sizes]="sizes()"
        [priority]="priority()"
        class="object-cover transition-transform duration-500 group-hover:scale-105"
        (error)="visibleSrc.set(null)"
      />
    } @else {
      <div class="absolute inset-0 bg-gradient-to-br" [class]="chapter().gradient">
        <trv-dunes class="absolute inset-x-0 bottom-0 h-1/2 text-black/25" />
        <trv-icon
          [name]="icon()"
          class="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-2/3 text-white/70 transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    }
  `,
})
export class MediaFrame {
  readonly src = input<string | null>(null);
  readonly alt = input('');
  readonly icon = input('dune');
  /** City slug: picks the placeholder's chapter gradient. */
  readonly city = input<string | null>(null);
  /** Above-the-fold images: loaded eagerly with high fetch priority. */
  readonly priority = input(false);
  readonly sizes = input('(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw');

  protected readonly chapter = computed(() => cityChapter(this.city()));

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
