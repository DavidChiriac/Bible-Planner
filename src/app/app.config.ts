import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideNgxWebstorage, withNgxWebstorageConfig, withSessionStorage } from 'ngx-webstorage';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, ...(environment.production ? [withHashLocation()] : [])),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase(getApp())),
    provideAuth(() => getAuth(getApp())),

    provideHttpClient(),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          cssLayer: false,
          darkModeSelector: true,
        },
      },
    }),

    provideNgxWebstorage(
      withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
      withSessionStorage()
    ),
  ],
};
