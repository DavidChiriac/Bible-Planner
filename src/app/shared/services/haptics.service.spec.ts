import { HapticsService } from './haptics.service';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

jest.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: jest.fn() },
}));

jest.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: jest.fn().mockResolvedValue(undefined),
    notification: jest.fn().mockResolvedValue(undefined),
  },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
}));

describe('HapticsService', () => {
  let service: HapticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HapticsService();
  });

  describe('on non-native platform', () => {
    beforeEach(() => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
      service = new HapticsService();
    });

    it('impact does nothing', async () => {
      await service.impact();
      expect(Haptics.impact).not.toHaveBeenCalled();
    });

    it('success does nothing', async () => {
      await service.success();
      expect(Haptics.notification).not.toHaveBeenCalled();
    });
  });

  describe('on native platform', () => {
    beforeEach(() => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(true);
      service = new HapticsService();
    });

    it('impact calls Haptics.impact with default Light style', async () => {
      await service.impact();
      expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
    });

    it('impact calls Haptics.impact with specified style', async () => {
      await service.impact(ImpactStyle.Medium);
      expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
    });

    it('success calls Haptics.notification', async () => {
      await service.success();
      expect(Haptics.notification).toHaveBeenCalledWith({ type: 'SUCCESS' as any });
    });

    it('light delegates to impact with Light', async () => {
      await service.light();
      expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
    });

    it('medium delegates to impact with Medium', async () => {
      await service.medium();
      expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Medium });
    });
  });
});
