import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Utils } from './utils.service';
import { FirebaseService } from './firebase.service';
import { HapticsService } from './haptics.service';
import { WidgetService } from './widget.service';
import { BibleTextService } from './bible-text.service';
import { PlanGeneratorService } from './plan-generator.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('Utils chapter completion', () => {
  let service: Utils;
  const firebase = {
    addChapters: jest.fn().mockResolvedValue('added'),
    deleteChapters: jest.fn().mockResolvedValue('deleted'),
    saveWidgetData: jest.fn(),
  };
  const haptics = { light: jest.fn(), medium: jest.fn(), success: jest.fn() };
  const widget = { updateWidget: jest.fn() };
  const planGenerator = { generate: jest.fn().mockReturnValue([]) };

  beforeEach(() => {
    jest.clearAllMocks();
    planGenerator.generate.mockReturnValue([]);
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: FirebaseService, useValue: firebase },
        { provide: HapticsService, useValue: haptics },
        { provide: WidgetService, useValue: widget },
        { provide: BibleTextService, useValue: {} },
        { provide: PlanGeneratorService, useValue: planGenerator },
        { provide: BreakpointObserver, useValue: {} },
      ],
    });
    service = TestBed.inject(Utils);
  });

  it('rejects individual, day and bulk completion without a plan', async () => {
    expect(() => service.toggleChapterRead('Geneza 1')).toThrow('Configure a reading plan');
    expect(() => service.markAllAsRead(['Geneza 1'])).toThrow('Configure a reading plan');
    await expect(service.setEntireDayRead(['Geneza 1'])).rejects.toThrow('Configure a reading plan');
    expect(firebase.addChapters).not.toHaveBeenCalled();
    expect(firebase.deleteChapters).not.toHaveBeenCalled();
    expect(service.readSet().size).toBe(0);
    expect(haptics.light).not.toHaveBeenCalled();
  });

  it('preserves individual, day and bulk completion with a plan', async () => {
    service.customPlanConfig.set({ books: ['Geneza'], days: 30 });
    service.toggleChapterRead('Geneza 1');
    await service.setEntireDayRead(['Geneza 2']);
    service.markAllAsRead(['Geneza 3']);
    expect(service.readSet()).toEqual(new Set(['Geneza 1', 'Geneza 2', 'Geneza 3']));
    expect(firebase.addChapters).toHaveBeenCalledTimes(3);
    service.toggleChapterRead('Geneza 1');
    expect(service.isChapterRead('Geneza 1')).toBe(false);
  });

  it('clears the active plan on reset so completion cannot continue after logout', () => {
    service.customPlanConfig.set({ books: ['Geneza'], days: 30 });
    service.reset();
    expect(service.planChaptersOrdered()).toEqual([]);
    expect(() => service.toggleChapterRead('Geneza 1')).toThrow('Configure a reading plan');
  });

  it('uses the same configured daily pace for the widget as the app status', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 18, 12));

    const days = Array.from({ length: 60 }, (_, index) => ({
      label: `Day ${index + 1}`,
      chapters: [`Geneza ${index + 1}`],
    }));
    planGenerator.generate.mockReturnValue([{ week: 1, label: 'Week 1', days }]);
    service.customPlanConfig.set({
      books: ['Geneza'],
      days: 20,
      places: 3,
      startDate: '2026-11-08',
      targetDate: '2026-12-08',
    });
    service.readSet.set(new Set(['Geneza 1', 'Geneza 2', 'Geneza 3']));

    try {
      service['updateWidget']();

      expect(firebase.saveWidgetData).toHaveBeenLastCalledWith(expect.objectContaining({
        step: '▼ 10 zile în urmă',
        stepType: 'behind',
      }));
      expect(widget.updateWidget).toHaveBeenLastCalledWith(
        expect.any(Number),
        expect.any(String),
        '▼ 10 zile în urmă',
        'behind',
        expect.any(String),
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
