import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { UniversalDisplayService } from './shared/services/universal-display-service.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: DeviceDetectorService,
      useClass: UniversalDisplayService
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
