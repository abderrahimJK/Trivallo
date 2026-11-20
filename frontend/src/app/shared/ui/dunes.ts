import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Three layered dune ridges, used as the bottom edge of heroes and placeholders.
 * Inherits its color from `currentColor`; the back layers are lighter.
 */
@Component({
  selector: 'trv-dunes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pointer-events-none block', 'aria-hidden': 'true' },
  template: `
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      class="block size-full"
      fill="currentColor"
    >
      <path opacity="0.25" d="M0 120C160 60 300 40 460 90s300 90 480 40 330-110 500-60v150H0Z" />
      <path opacity="0.5" d="M0 160c200-70 380-90 560-40s340 70 520 20 260-60 360-40v120H0Z" />
      <path d="M0 190c240-40 470-50 720-20s480 30 720-10v60H0Z" />
    </svg>
  `,
})
export class Dunes {}
