import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';

interface WidgetBridgePlugin {
  updateWidget(options: {
    progress: string;
    status: string;
    step: string;
    stepType: string;
    todayReading: string;
  }): Promise<{ success: boolean }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private readonly isAndroid = Capacitor.getPlatform() === 'android';

  async updateWidget(progress: number, status: string, step: string, stepType: string, todayReading: string): Promise<void> {
    if (!this.isAndroid) return;

    try {
      await WidgetBridge.updateWidget({
        progress: String(Math.round(progress * 100) / 100),
        status,
        step,
        stepType,
        todayReading,
      });
    } catch {
      // Widget may not be placed on home screen yet — silently ignore
    }
  }
}
