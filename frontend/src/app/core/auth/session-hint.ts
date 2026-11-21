import { Injectable, signal } from '@angular/core';

const KEY = 'trv.session.name';

/**
 * The signed-in person's name, for the public header. Public pages do not load the sign-in
 * library, so the sign-in flow leaves this note in the tab's sessionStorage (like the tokens).
 * It is display only: every page that needs the account checks the real session itself.
 */
@Injectable({ providedIn: 'root' })
export class SessionHint {
  readonly name = signal<string | null>(null);

  /** Call in the browser only (after render), so the server and first client render agree. */
  load(): void {
    this.name.set(read());
  }

  set(name: string): void {
    write(name);
    this.name.set(name);
  }

  clear(): void {
    write(null);
    this.name.set(null);
  }
}

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function write(value: string | null): void {
  try {
    if (value) sessionStorage.setItem(KEY, value);
    else sessionStorage.removeItem(KEY);
  } catch {
    // Storage blocked: the header just keeps showing "Sign in".
  }
}
