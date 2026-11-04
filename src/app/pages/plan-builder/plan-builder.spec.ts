import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlanBuilder } from './plan-builder';
import { Utils } from '../../shared/services/utils.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { I18nService } from '../../shared/services/i18n.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('PlanBuilder progress cleanup', () => {
  const utils = {
    customPlanConfig: signal(null),
    readSet: signal(new Set<string>()),
  };
  const firebase = {
    setCustomPlanConfig: jest.fn().mockResolvedValue(undefined),
    deleteChapters: jest.fn().mockResolvedValue('deleted'),
  };
  const router = { navigate: jest.fn() };
  let builder: PlanBuilder;

  beforeEach(() => {
    jest.clearAllMocks();
    utils.customPlanConfig.set(null);
    utils.readSet.set(new Set());
    TestBed.configureTestingModule({
      providers: [
        { provide: Utils, useValue: utils },
        { provide: FirebaseService, useValue: firebase },
        { provide: Router, useValue: router },
        { provide: I18nService, useValue: {} },
      ],
    });
    builder = TestBed.runInInjectionContext(() => new PlanBuilder());
    builder.toggleBook('ot', 0);
    builder.onDaysChange(30);
  });

  it('deletes read chapters outside the new plan, including exclusions, and keeps matching progress', async () => {
    utils.readSet.set(new Set(['Geneza 1', 'Geneza 5', 'Exodul 1']));
    builder.excludeGenealogies.set(true);
    await builder.generate();
    expect(firebase.deleteChapters).toHaveBeenCalledWith(['Geneza 5', 'Exodul 1']);
    expect(utils.readSet()).toEqual(new Set(['Geneza 1']));
    expect(router.navigate).toHaveBeenCalledWith(['/plans']);
  });

  it('does not delete anything when all read chapters belong to the new plan', async () => {
    utils.readSet.set(new Set(['Geneza 1']));
    await builder.generate();
    expect(firebase.deleteChapters).not.toHaveBeenCalled();
    expect(utils.readSet()).toEqual(new Set(['Geneza 1']));
  });

  it('does not navigate or clear local progress when deletion fails', async () => {
    utils.readSet.set(new Set(['Exodul 1']));
    firebase.deleteChapters.mockRejectedValueOnce(new Error('Deletion failed'));
    await expect(builder.generate()).rejects.toThrow('Deletion failed');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(utils.readSet()).toEqual(new Set(['Exodul 1']));
  });
});
