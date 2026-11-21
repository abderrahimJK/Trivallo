import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

/** Shown instead of an empty page when the sign-in service (Keycloak) cannot be reached. */
@Component({
  selector: 'trv-sign-in-unavailable-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container-page py-12 sm:py-16">
      <div class="mx-auto max-w-lg rounded-2xl border border-border p-6 sm:p-8" role="alert">
        <h1 class="text-2xl sm:text-3xl" i18n="@@signInUnavailable.title">
          Sign-in is unavailable right now
        </h1>
        <p class="mt-3 text-muted-foreground" i18n="@@signInUnavailable.body">
          We couldn't reach the sign-in service. Please try again in a few minutes.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" class="btn-cta" (click)="retry()" i18n="@@signInUnavailable.retry">
            Try again
          </button>
          <a routerLink="/" class="btn-outline" i18n="@@signInUnavailable.home">Back to home</a>
        </div>
      </div>
    </section>
  `,
})
export class SignInUnavailablePage {
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Title).setTitle(
      $localize`:@@signInUnavailable.pageTitle:Sign-in unavailable · Trivallo`,
    );
  }

  /** Full reload of /account: the guard tries Keycloak again and keeps the page asked for. */
  protected retry(): void {
    this.document.location.assign(new URL('account', this.document.baseURI));
  }
}
