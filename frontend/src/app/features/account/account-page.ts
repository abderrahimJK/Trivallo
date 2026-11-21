import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AccountSession } from '../../core/auth/account-session';

/** Landing page after sign-in: who is signed in, the admin entry for admins, and sign-out. */
@Component({
  selector: 'trv-account-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container-page py-12 sm:py-16">
      <div class="mx-auto max-w-lg rounded-2xl border border-border p-6 sm:p-8">
        <h1 class="text-3xl" i18n="@@account.title">Your account</h1>
        <p class="mt-4 text-muted-foreground" i18n="@@account.signedInAs">Signed in as</p>
        <p class="text-lg font-semibold">{{ session.displayName() }}</p>
        @if (session.email() && session.email() !== session.displayName()) {
          <p class="text-muted-foreground">{{ session.email() }}</p>
        }

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          @if (session.isAdmin()) {
            <a routerLink="/admin" class="btn-cta" i18n="@@account.openAdmin"
              >Open the admin dashboard</a
            >
          } @else {
            <a routerLink="/activities" class="btn-cta" i18n="@@account.browseTrips"
              >Browse trips</a
            >
          }
          <button
            type="button"
            class="btn-outline"
            (click)="session.signOut()"
            i18n="@@account.signOut"
          >
            Sign out
          </button>
        </div>
      </div>
    </section>
  `,
})
export class AccountPage {
  protected readonly session = inject(AccountSession);

  constructor() {
    inject(Title).setTitle($localize`:@@account.pageTitle:Your account · Trivallo`);
  }
}
