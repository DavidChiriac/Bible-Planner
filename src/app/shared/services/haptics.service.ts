import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  private readonly isNative = Capacitor.isNativePlatform();

  async impact(style: ImpactStyle = ImpactStyle.Light) {
    if (!this.isNative) return;
    await Haptics.impact({ style });
  }

  async success() {
    if (!this.isNative) return;
    await Haptics.notification({ type: NotificationType.Success });
  }

  async light() {
    return this.impact(ImpactStyle.Light);
  }

  async medium() {
    return this.impact(ImpactStyle.Medium);
  }
}
