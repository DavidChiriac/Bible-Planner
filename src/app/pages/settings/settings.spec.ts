import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Settings } from './settings';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('Settings plan deletion', () => {
  const firebase = {
    resetProgress: jest.fn().mockResolvedValue('progress reset'),
    deleteCustomPlanConfig: jest.fn().mockResolvedValue(undefined),
  };
  const router = { navigate: jest.fn().mockResolvedValue(true) };
  const utils = {
    readSet: { set: jest.fn() },
    favouriteWeeks: { set: jest.fn() },
    startDate: { set: jest.fn() },
    months: { set: jest.fn() },
    customPlanConfig: { set: jest.fn() },
  };
  let settings: Settings;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseService, useValue: firebase },
        { provide: Utils, useValue: utils },
        { provide: I18nService, useValue: { setLang: jest.fn() } },
        { provide: Router, useValue: router },
      ],
    });
    settings = TestBed.runInInjectionContext(() => new Settings());
    settings.deletePlanVisible = true;
  });

  it('resets progress, deletes the plan, and navigates to the plan builder', async () => {
    await settings.confirmDeleteCustomPlan();

    expect(settings.deletePlanVisible).toBe(false);
    expect(firebase.resetProgress).toHaveBeenCalledTimes(1);
    expect(utils.readSet.set).toHaveBeenCalledWith(new Set());
    expect(utils.favouriteWeeks.set).toHaveBeenCalledWith([]);
    expect(utils.startDate.set).toHaveBeenCalledWith(null);
    expect(utils.months.set).toHaveBeenCalledWith(null);
    expect(firebase.deleteCustomPlanConfig).toHaveBeenCalledTimes(1);
    expect(utils.customPlanConfig.set).toHaveBeenCalledWith(null);
    expect(router.navigate).toHaveBeenCalledWith(['/plan-builder']);
  });
});
