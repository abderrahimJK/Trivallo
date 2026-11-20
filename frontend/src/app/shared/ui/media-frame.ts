import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { Icon } from './icon';

/**
 * Image with a fixed aspect ratio. Until real photos are uploaded it shows a warm
 * gradient with the category icon, so layouts look finished without stock images.
 * The same placeholder replaces an image that fails to load.
 */
@Component({
  selector: 'trv-media-frame',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-hidden bg-sand-100' },
  template: `
    @if (visibleSrc(); as url) {
      <img
        #image
        [src]="url"
        [alt]="alt()"
        [attr.loading]="eager() ? 'eager' : 'lazy'"
        class="size-full object-cover"
        (error)="visibleSrc.set(null)"
      />
    } @else {
      <div
        class="flex size-full items-center justify-center bg-gradient-to-br from-sand-200 via-sand-100 to-terracotta-400/30"
      >
        <trv-icon [name]="icon()" class="size-12 text-terracotta-500/70" />
      </div>
    }
  `,
})
export class MediaFrame {
  readonly src = input<string | null>(null);
  readonly alt = input('');
  readonly icon = input('dune');
  readonly eager = input(false);

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
