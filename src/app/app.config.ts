import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideNgxWebstorage, withNgxWebstorageConfig, withSessionStorage } from 'ngx-webstorage';

import { Capacitor } from '@capacitor/core';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const hydrationProviders = Capacitor.isNativePlatform()
  ? []
  : [provideClientHydration(withEventReplay())];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, ...(environment.production ? [withHashLocation()] : [])),
    ...hydrationProviders,

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
