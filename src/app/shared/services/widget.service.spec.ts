// The mock fn must be declared before jest.mock so hoisting works
const _mockUpdateWidget = jest.fn().mockResolvedValue({ success: true });

jest.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: jest.fn() },
  registerPlugin: jest.fn(() => ({
    updateWidget: _mockUpdateWidget,
  })),
}));

import { WidgetService } from './widget.service';
import { Capacitor } from '@capacitor/core';

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(() => {
    _mockUpdateWidget.mockClear();
    _mockUpdateWidget.mockResolvedValue({ success: true });
  });

  describe('on non-android platform', () => {
    beforeEach(() => {
      (Capacitor.getPlatform as jest.Mock).mockReturnValue('web');
      service = new WidgetService();
    });

    it('does nothing', async () => {
      await service.updateWidget(50, 'completat', 'step', 'ahead', 'reading');
      expect(_mockUpdateWidget).not.toHaveBeenCalled();
    });
  });

  describe('on android', () => {
    beforeEach(() => {
      (Capacitor.getPlatform as jest.Mock).mockReturnValue('android');
      service = new WidgetService();
    });

    it('calls WidgetBridge.updateWidget with formatted params', async () => {
      await service.updateWidget(75.555, 'completat', 'step', 'ahead', 'reading');
      expect(_mockUpdateWidget).toHaveBeenCalledWith({
        progress: '75.56',
        status: 'completat',
        step: 'step',
        stepType: 'ahead',
        todayReading: 'reading',
      });
    });

    it('silently catches errors', async () => {
      _mockUpdateWidget.mockRejectedValueOnce(new Error('widget not placed'));
      await expect(
        service.updateWidget(10, 'status', 'step', 'behind', 'reading')
      ).resolves.toBeUndefined();
    });
  });
});
