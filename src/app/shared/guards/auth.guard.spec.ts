import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { authGuard } from './auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, of, isObservable } from 'rxjs';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('authGuard', () => {
  let mockRouter: { createUrlTree: jest.Mock };
  let mockAuth: { authStateReady: jest.Mock; currentUser: any };
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockRouter = { createUrlTree: jest.fn().mockReturnValue('login-tree' as any) };
    mockAuth = { authStateReady: jest.fn().mockResolvedValue(undefined), currentUser: null };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Auth, useValue: mockAuth },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  it('allows access when user is logged in', async () => {
    mockAuth.currentUser = { uid: '123' };
    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));

    if (isObservable(result)) {
      const value = await firstValueFrom(result);
      expect(value).toBe(true);
    } else {
      expect(result).toBe(true);
    }
  });

  it('redirects to /login when user is not logged in', async () => {
    mockAuth.currentUser = null;
    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));

    if (isObservable(result)) {
      const value = await firstValueFrom(result);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    } else {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    }
  });

  it('returns true on server platform', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Auth, useValue: mockAuth },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
    expect(result).toBe(true);
  });
});
