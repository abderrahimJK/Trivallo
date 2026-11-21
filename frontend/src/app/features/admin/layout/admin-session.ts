import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OidcSecurityService } from 'angular-auth-oidc-client';

/** The signed-in admin, as the header shows them, and sign-out. */
@Injectable({ providedIn: 'root' })
export class AdminSession {
  private readonly oidc = inject(OidcSecurityService);
  private readonly userData = toSignal(this.oidc.userData$);

  readonly displayName = computed(() => {
    const data = this.userData()?.userData as { name?: string; email?: string } | null;
    return data?.name || data?.email || 'Admin';
  });

  signOut(): void {
    this.oidc.logoff().subscribe();
  }
}
