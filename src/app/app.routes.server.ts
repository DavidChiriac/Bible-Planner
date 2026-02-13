import { provideServerRendering } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UniversalDisplayService } from './shared/services/universal-display-service.service';

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
