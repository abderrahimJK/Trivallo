import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AccountSession } from '../../../core/auth/account-session';

/** Signed in, but the account does not have the ADMIN role. */
@Component({
  selector: 'trv-admin-forbidden-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid min-h-dvh place-items-center bg-muted px-4">
      <div class="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center">
        <h1 class="text-2xl font-bold">No admin access</h1>
        <p class="mt-3 text-muted-foreground">
          You are signed in as {{ session.displayName() }}, but this account cannot manage the
          catalogue. Ask an administrator for the admin role, or sign in with another account.
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" class="btn-cta" (click)="session.signOut()">Sign out</button>
          <a href="/" class="btn-outline">Back to the site</a>
        </div>
      </div>
    </main>
  `,
})
export class AdminForbiddenPage {
  protected readonly session = inject(AccountSession);
}
