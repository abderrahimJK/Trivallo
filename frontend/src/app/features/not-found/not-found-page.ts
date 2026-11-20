import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotFoundView } from './not-found-view';

@Component({
  selector: 'trv-not-found-page',
  imports: [NotFoundView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<trv-not-found-view />`,
})
export class NotFoundPage {}
