import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { SessionHint } from './session-hint';
import { displayName, hasAdminRole, TokenClaims } from './signed-in.guard';

/** The signed-in person (account page and admin), and sign-out. Only used behind the guards. */
@Injectable({ providedIn: 'root' })
export class AccountSession {
  private readonly oidc = inject(OidcSecurityService);
  private readonly hint = inject(SessionHint);
  private readonly claims = toSignal(this.oidc.getPayloadFromAccessToken(), { initialValue: null });
  private readonly userData = toSignal(this.oidc.userData$);

  readonly displayName = computed(() => {
    const data = this.userData()?.userData as TokenClaims | null;
    return displayName(data) || displayName(this.claims());
  });
  readonly email = computed(() => {
    const data = this.userData()?.userData as TokenClaims | null;
    return data?.email ?? this.claims()?.email ?? '';
  });
  readonly isAdmin = computed(() => hasAdminRole(this.claims()));

  /** Ends the Keycloak session too, then Keycloak sends the browser back to the home page. */
  signOut(): void {
    this.hint.clear();
    this.oidc.logoff().subscribe();
  }
}
