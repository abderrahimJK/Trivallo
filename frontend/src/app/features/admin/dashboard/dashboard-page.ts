import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { adminApi } from '../api/admin-api';
import { ActivityStats } from '../api/admin.models';
import { AdminPageHeader } from '../ui/page-header';

interface StatTile {
  label: string;
  value: number;
  hint: string;
  link: string;
  queryParams?: Record<string, string>;
  needsAction: boolean;
}

/** Catalogue health at a glance: what is live, and what still blocks publishing quality. */
@Component({
  selector: 'trv-dashboard-page',
  imports: [RouterLink, AdminPageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <trv-admin-page-header title="Dashboard">
      <a routerLink="/admin/activities/new" class="btn-cta">New activity</a>
    </trv-admin-page-header>

    @if (stats.error()) {
      <p role="alert" class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
        The figures could not be loaded.
        <button type="button" class="link" (click)="stats.reload()">Try again</button>
      </p>
    } @else {
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Catalogue figures">
        @for (tile of tiles(); track tile.label) {
          <li>
            <a
              [routerLink]="tile.link"
              [queryParams]="tile.queryParams"
              class="block h-full rounded-xl border bg-background p-5 transition-colors hover:border-foreground/40"
              [class.border-amber-300]="tile.needsAction"
              [class.border-border]="!tile.needsAction"
            >
              <p class="text-sm font-semibold text-muted-foreground">{{ tile.label }}</p>
              <p class="mt-2 text-3xl font-extrabold tabular-nums">
                {{ stats.isLoading() ? '–' : tile.value }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">{{ tile.hint }}</p>
            </a>
          </li>
        }
      </ul>
    }

    <section class="mt-10 grid gap-4 md:grid-cols-3" aria-label="Shortcuts">
      <a
        routerLink="/admin/activities"
        class="rounded-xl border border-border bg-background p-5 hover:border-foreground/40"
      >
        <h2 class="text-lg font-bold">Activities</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Texts in English and French, prices, photos and publishing.
        </p>
      </a>
      <a
        routerLink="/admin/cities"
        class="rounded-xl border border-border bg-background p-5 hover:border-foreground/40"
      >
        <h2 class="text-lg font-bold">Cities</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Destination names, descriptions and hero photos.
        </p>
      </a>
      <a
        routerLink="/admin/categories"
        class="rounded-xl border border-border bg-background p-5 hover:border-foreground/40"
      >
        <h2 class="text-lg font-bold">Categories</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          The "ways to travel" used to group activities.
        </p>
      </a>
    </section>
  `,
})
export class DashboardPage {
  protected readonly stats = httpResource<ActivityStats>(() => adminApi.activityStats());

  protected readonly tiles = computed<StatTile[]>(() => {
    const s = this.stats.value();
    return [
      {
        label: 'Published',
        value: s?.published ?? 0,
        hint: 'Visible on the site',
        link: '/admin/activities',
        queryParams: { status: 'PUBLISHED' },
        needsAction: false,
      },
      {
        label: 'Drafts',
        value: s?.draft ?? 0,
        hint: 'Not visible yet',
        link: '/admin/activities',
        queryParams: { status: 'DRAFT' },
        needsAction: false,
      },
      {
        label: 'Archived',
        value: s?.archived ?? 0,
        hint: 'Hidden from the site',
        link: '/admin/activities',
        queryParams: { status: 'ARCHIVED' },
        needsAction: false,
      },
      {
        label: 'Without photos',
        value: s?.missingImages ?? 0,
        hint: 'Published or draft',
        link: '/admin/activities',
        needsAction: (s?.missingImages ?? 0) > 0,
      },
      {
        label: 'Missing French',
        value: s?.missingFrench ?? 0,
        hint: 'Shown in English on /fr',
        link: '/admin/activities',
        needsAction: (s?.missingFrench ?? 0) > 0,
      },
    ];
  });
}
