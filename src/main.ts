import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { Fullscreen } from '@boengli/capacitor-fullscreen';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
