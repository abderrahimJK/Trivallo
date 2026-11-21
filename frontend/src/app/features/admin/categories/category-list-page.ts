import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { adminApi } from '../api/admin-api';
import { CategoryAdmin } from '../api/admin.models';
import { AdminPageHeader } from '../ui/page-header';

@Component({
  selector: 'trv-category-list-page',
  imports: [RouterLink, AdminPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <trv-admin-page-header title="Categories">
      <a routerLink="/admin/categories/new" class="btn-cta">New category</a>
    </trv-admin-page-header>

    @if (categories.error()) {
      <p role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
        Categories could not be loaded.
        <button type="button" class="link" (click)="categories.reload()">Try again</button>
      </p>
    } @else {
      <div class="overflow-x-auto rounded-xl border border-border bg-background">
        <table class="w-full min-w-[36rem] text-left text-sm">
          <thead class="border-b border-border text-muted-foreground">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">English</th>
              <th scope="col" class="px-4 py-3 font-semibold">French</th>
              <th scope="col" class="px-4 py-3 font-semibold">Slug</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Order</th>
            </tr>
          </thead>
          <tbody>
            @for (c of categories.value() ?? []; track c.id) {
              <tr class="border-b border-border last:border-0 hover:bg-muted/60">
                <td class="px-4 py-3">
                  <a
                    [routerLink]="['/admin/categories', c.id]"
                    class="font-semibold hover:underline"
                    >{{ nameIn(c, 'en') ?? c.slug }}</a
                  >
                </td>
                <td class="px-4 py-3">
                  {{ nameIn(c, 'fr') ?? '' }}
                  @if (!nameIn(c, 'fr')) {
                    <span class="tag bg-amber-100 text-amber-900">Missing</span>
                  }
                </td>
                <td class="px-4 py-3 font-mono text-xs">{{ c.slug }}</td>
                <td class="px-4 py-3 text-right tabular-nums">{{ c.sortOrder }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-muted-foreground">
                  {{ categories.isLoading() ? 'Loading…' : 'No categories yet.' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class CategoryListPage {
  protected readonly categories = httpResource<CategoryAdmin[]>(() => adminApi.categories());

  protected nameIn(category: CategoryAdmin, locale: string): string | undefined {
    return category.translations.find((t) => t.locale === locale)?.name;
  }
}
