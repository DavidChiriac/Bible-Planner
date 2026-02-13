import { Inject, Injectable, Optional, PLATFORM_ID, REQUEST } from '@angular/core';
import { Request } from 'express';
import { DeviceDetectorService } from 'ngx-device-detector';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class UniversalDisplayService extends DeviceDetectorService {
  constructor(@Inject(PLATFORM_ID) platformId: any, @Optional() @Inject(REQUEST) request: Request) {
    super();
    if (isPlatformServer(platformId)) {
      super.setDeviceInfo((request && request.headers['user-agent'] as string) || '');
    }
  }
}
