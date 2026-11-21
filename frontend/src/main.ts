/// <reference types="@angular/localize" />

import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { needsSignIn } from './app/core/auth/auth-area';

/**
 * The sign-in library (~140 kB) is only loaded when the app starts on /account or /admin.
 * Opening those from a public page reloads the page (see signed-in.guard.ts), which loads it then.
 */
const signInProviders = needsSignIn(location.pathname)
  ? import('./app/core/auth/auth.providers').then((m) => m.authProviders)
  : Promise.resolve([]);

signInProviders
  .then((providers) => bootstrapApplication(App, mergeApplicationConfig(appConfig, { providers })))
  .catch((err) => console.error(err));
