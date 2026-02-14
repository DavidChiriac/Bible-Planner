import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

if (Capacitor.isNativePlatform()) {
  await SocialLogin.initialize({
    google: {
      webClientId: '820329179054-2uem7c7j3lb6ukr0lvu6uqle0avqouia.apps.googleusercontent.com',
      mode: 'online',
    },
  });
}
