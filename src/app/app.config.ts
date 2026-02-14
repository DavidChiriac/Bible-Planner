import { ApplicationConfig, inject, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp, FirebaseApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth, initializeAuth, indexedDBLocalPersistence } from '@angular/fire/auth';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {provideNgxWebstorage, withNgxWebstorageConfig, withSessionStorage} from 'ngx-webstorage';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';

const hydrationProviders = Capacitor.isNativePlatform()
  ? []
  : [provideClientHydration(withEventReplay())];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, ...(environment.production ? [withHashLocation()] : [])),
    ...hydrationProviders,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
    provideHttpClient(),
    provideAuth(() => {
      const app = inject(FirebaseApp);

      if (Capacitor.isNativePlatform()) {
        return initializeAuth(app, {
          persistence: indexedDBLocalPersistence,
        });
      }

      return getAuth(app);
    }),
    providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    cssLayer: false
                }
            },
        }),
    provideNgxWebstorage(
		withNgxWebstorageConfig({ separator: ':', caseSensitive: true }),
		withSessionStorage()
	), provideClientHydration(withEventReplay())
  ]
};
