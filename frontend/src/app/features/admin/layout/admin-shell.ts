import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from '../../../shared/ui/icon';
import { AccountSession } from '../../../core/auth/account-session';

interface NavItem {
  label: string;
  path: string;
  exact: boolean;
}

/** Admin layout: sidebar navigation on desktop, a top bar with a menu toggle on phones. */
@Component({
  selector: 'trv-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-dvh bg-muted md:grid md:grid-cols-[15rem_1fr]">
      <aside
        class="border-b border-border bg-background md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0"
      >
        <div class="flex h-16 items-center justify-between gap-2 px-5">
          <a routerLink="/admin" class="text-lg font-extrabold tracking-tight">
            Trivallo <span class="font-semibold text-muted-foreground">admin</span>
          </a>
          <button
            type="button"
            class="inline-flex size-11 items-center justify-center rounded-lg md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="admin-nav"
            aria-label="Menu"
            (click)="menuOpen.set(!menuOpen())"
          >
            <trv-icon [name]="menuOpen() ? 'x' : 'menu'" class="size-6" />
          </button>
        </div>
        <nav
          id="admin-nav"
          aria-label="Admin"
          class="px-3 pb-4 md:block"
          [class.hidden]="!menuOpen()"
        >
          <ul class="space-y-1">
            @for (item of nav; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-secondary text-on-secondary"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  class="flex min-h-11 items-center rounded-lg px-3 font-medium hover:bg-muted"
                  (click)="menuOpen.set(false)"
                  >{{ item.label }}</a
                >
              </li>
            }
          </ul>
          <div class="mt-6 border-t border-border pt-4">
            <p class="truncate px-3 text-sm text-muted-foreground">{{ session.displayName() }}</p>
            <a
              routerLink="/"
              class="flex min-h-11 items-center rounded-lg px-3 text-sm hover:bg-muted"
            >
              View site
            </a>
            <button
              type="button"
              class="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm hover:bg-muted"
              (click)="session.signOut()"
            >
              Sign out
            </button>
          </div>
        </nav>
      </aside>
      <main class="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminShell {
  protected readonly session = inject(AccountSession);
  protected readonly menuOpen = signal(false);

  protected readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/admin', exact: true },
    { label: 'Activities', path: '/admin/activities', exact: false },
    { label: 'Cities', path: '/admin/cities', exact: false },
    { label: 'Categories', path: '/admin/categories', exact: false },
  ];
}
