import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';

/** Previous / next links that keep the other query params. Pages are zero-based in the API, one-based on screen. */
@Component({
  selector: 'trv-pagination',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <nav
        class="flex items-center justify-center gap-3"
        i18n-aria-label="@@pagination.label"
        aria-label="Pagination"
      >
        @if (page() > 0) {
          <a
            class="btn-outline"
            [routerLink]="[]"
            [queryParams]="{ page: page() - 1 || null }"
            queryParamsHandling="merge"
          >
            <trv-icon name="chevron-left" class="size-4" />
            <ng-container i18n="@@pagination.previous">Previous</ng-container>
          </a>
        }
        <span class="text-sm text-muted-foreground" i18n="@@pagination.status"
          >Page {{ displayPage() }} of {{ totalPages() }}</span
        >
        @if (page() < totalPages() - 1) {
          <a
            class="btn-outline"
            [routerLink]="[]"
            [queryParams]="{ page: page() + 1 }"
            queryParamsHandling="merge"
          >
            <ng-container i18n="@@pagination.next">Next</ng-container>
            <trv-icon name="chevron-right" class="size-4" />
          </a>
        }
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();

  protected readonly displayPage = computed(() => this.page() + 1);
}
