import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Shape =
  | { type: 'path'; d: string }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx: number };

/**
 * 24x24 stroke icons, described as data and rendered with attribute bindings
 * (no innerHTML, which the server-side DOM does not support on SVG elements).
 */
const ICONS: Record<string, Shape[]> = {
  'map-pin': [
    { type: 'path', d: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z' },
    { type: 'circle', cx: 12, cy: 9, r: 2.5 },
  ],
  clock: [
    { type: 'circle', cx: 12, cy: 12, r: 9 },
    { type: 'path', d: 'M12 7v5l3 2' },
  ],
  users: [
    { type: 'circle', cx: 9, cy: 8, r: 3.5 },
    { type: 'path', d: 'M2.5 20a6.5 6.5 0 0 1 13 0' },
    { type: 'path', d: 'M16 4.5a3.5 3.5 0 0 1 0 7' },
    { type: 'path', d: 'M18 14a6 6 0 0 1 3.5 6' },
  ],
  calendar: [
    { type: 'rect', x: 3, y: 5, width: 18, height: 16, rx: 2 },
    { type: 'path', d: 'M3 10h18M8 3v4M16 3v4' },
  ],
  check: [{ type: 'path', d: 'M5 12.5l4.5 4.5L19 7.5' }],
  x: [{ type: 'path', d: 'M6 6l12 12M18 6L6 18' }],
  'chevron-left': [{ type: 'path', d: 'M15 6l-6 6 6 6' }],
  'chevron-right': [{ type: 'path', d: 'M9 6l6 6-6 6' }],
  'arrow-right': [{ type: 'path', d: 'M5 12h14M13 6l6 6-6 6' }],
  globe: [
    { type: 'circle', cx: 12, cy: 12, r: 9 },
    { type: 'path', d: 'M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18' },
  ],
  menu: [{ type: 'path', d: 'M4 6h16M4 12h16M4 18h16' }],
  filters: [{ type: 'path', d: 'M4 6h16M7 12h10M10 18h4' }],
  external: [
    {
      type: 'path',
      d: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    },
  ],
  dune: [
    { type: 'path', d: 'M2 18c3-5 6-7 9-7s5 3 11 7' },
    { type: 'path', d: 'M2 21h20' },
    { type: 'circle', cx: 17, cy: 6, r: 2 },
  ],
  route: [
    { type: 'circle', cx: 6, cy: 19, r: 2 },
    { type: 'circle', cx: 18, cy: 5, r: 2 },
    { type: 'path', d: 'M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8' },
  ],
  camel: [
    { type: 'path', d: 'M3 20v-6c0-2 2-3 4-3 1-3 3-3 4 0 2-2 4-2 5 1h2a2 2 0 0 1 2 2v1' },
    { type: 'path', d: 'M7 20v-4M16 20v-4' },
  ],
  quad: [
    { type: 'circle', cx: 6, cy: 16, r: 3 },
    { type: 'circle', cx: 18, cy: 16, r: 3 },
    { type: 'path', d: 'M9 16h6M6 13l3-5h6l3 5' },
  ],
  balloon: [
    { type: 'path', d: 'M12 3a6 6 0 0 1 6 6c0 4-4 7-5 8h-2c-1-1-5-4-5-8a6 6 0 0 1 6-6z' },
    { type: 'rect', x: 10.5, y: 19, width: 3, height: 2, rx: 0 },
  ],
  mountain: [{ type: 'path', d: 'M3 20l6-10 4 6 2-3 6 7z' }],
  kasbah: [
    { type: 'path', d: 'M4 21V9l3-2 3 2V6l2-2 2 2v3l3-2 3 2v12z' },
    { type: 'path', d: 'M10 21v-4h4v4' },
  ],
  tagine: [
    { type: 'path', d: 'M4 17h16' },
    { type: 'path', d: 'M6 17c0-5 3-9 6-11 3 2 6 6 6 11' },
    { type: 'path', d: 'M12 4v2M5 20h14' },
  ],
};

@Component({
  selector: 'trv-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block shrink-0', '[attr.aria-hidden]': 'true' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-full"
    >
      @for (shape of shapes(); track $index) {
        @switch (shape.type) {
          @case ('path') {
            <svg:path [attr.d]="shape.d" />
          }
          @case ('circle') {
            <svg:circle [attr.cx]="shape.cx" [attr.cy]="shape.cy" [attr.r]="shape.r" />
          }
          @case ('rect') {
            <svg:rect
              [attr.x]="shape.x"
              [attr.y]="shape.y"
              [attr.width]="shape.width"
              [attr.height]="shape.height"
              [attr.rx]="shape.rx"
            />
          }
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<string>();

  protected readonly shapes = computed(() => ICONS[this.name()] ?? ICONS['dune']);
}
