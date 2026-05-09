jest.mock('@angular/fire/auth', () => ({
  authState: jest.fn(() => ({ subscribe: jest.fn() })),
}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: jest.fn().mockReturnValue(false), getPlatform: jest.fn().mockReturnValue('web') },
  registerPlugin: jest.fn(() => ({ updateWidget: jest.fn() })),
}));
jest.mock('@capacitor/haptics', () => ({
  Haptics: { impact: jest.fn(), notification: jest.fn() },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' },
}));
jest.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: { signInWithGoogle: jest.fn(), signOut: jest.fn() },
}));
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: Object.assign(jest.fn().mockImplementation(() => ({})), {
    credential: jest.fn(),
  }),
  signInWithCredential: jest.fn(),
  signInWithPopup: jest.fn(),
}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { Utils } from './utils.service';
import { Capacitor } from '@capacitor/core';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: { navigateByUrl: jest.Mock; navigate: jest.Mock };
  let mockFirebase: { getAuth: jest.Mock; logout: jest.Mock };
  let mockUtils: { reset: jest.Mock };

  beforeEach(() => {
    mockRouter = { navigateByUrl: jest.fn().mockResolvedValue(true), navigate: jest.fn().mockResolvedValue(true) };
    mockFirebase = { getAuth: jest.fn().mockReturnValue({}), logout: jest.fn().mockResolvedValue(undefined) };
    mockUtils = { reset: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: FirebaseService, useValue: mockFirebase },
        { provide: Utils, useValue: mockUtils },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn returns false initially', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  describe('logout', () => {
    it('calls firebase.logout and navigates to /login', async () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
      await service.logout();
      expect(mockFirebase.logout).toHaveBeenCalled();
      expect(mockUtils.reset).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('login (web)', () => {
    it('calls authenticateWithGoogleWeb on non-native', async () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
      const { signInWithPopup } = require('firebase/auth');
      signInWithPopup.mockResolvedValue({ user: { uid: '123' } });

      await service.login();
      expect(signInWithPopup).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('does not navigate on failed login', async () => {
      (Capacitor.isNativePlatform as jest.Mock).mockReturnValue(false);
      const { signInWithPopup } = require('firebase/auth');
      signInWithPopup.mockRejectedValue(new Error('popup closed'));

      await service.login();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });
});
