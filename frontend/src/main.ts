/// <reference types="@angular/localize" />

import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { isAdminPath } from './app/core/auth/admin-area';

/**
 * The admin's sign-in library (~140 kB) is only loaded when the app starts on an admin page.
 * Opening the admin from a public page reloads it (see adminGuard), which loads it then.
 */
const adminProviders = isAdminPath(location.pathname)
  ? import('./app/core/auth/auth.providers').then((m) => m.adminAuthProviders)
  : Promise.resolve([]);

adminProviders
  .then((providers) => bootstrapApplication(App, mergeApplicationConfig(appConfig, { providers })))
  .catch((err) => console.error(err));
