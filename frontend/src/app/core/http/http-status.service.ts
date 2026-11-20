import { inject, Injectable, RESPONSE_INIT } from '@angular/core';

/** Lets a page set the HTTP status of the server-rendered response (e.g. 404 for an unknown slug). */
@Injectable({ providedIn: 'root' })
export class HttpStatusService {
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  setStatus(status: number): void {
    if (this.responseInit) {
      this.responseInit.status = status;
    }
  }
}
