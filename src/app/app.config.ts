import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import {provideNgxWebstorage, withNgxWebstorageConfig, withSessionStorage} from 'ngx-webstorage';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
    provideHttpClient(),
    provideAuth(() => getAuth()),
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
