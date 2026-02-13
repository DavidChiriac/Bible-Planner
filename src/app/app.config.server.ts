import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { appConfig } from './app.config';
import { UniversalDisplayService } from './shared/services/universal-display-service.service';
import { DeviceDetectorService } from 'ngx-device-detector';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {
      provide: DeviceDetectorService,
      useClass: UniversalDisplayService
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
