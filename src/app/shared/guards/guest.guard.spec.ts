import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { guestGuard } from './guest.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('guestGuard', () => {
  let mockRouter: { createUrlTree: jest.Mock };
  let mockAuth: { authStateReady: jest.Mock; currentUser: any };
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    mockRouter = { createUrlTree: jest.fn().mockReturnValue('home-tree' as any) };
    mockAuth = { authStateReady: jest.fn().mockResolvedValue(undefined), currentUser: null };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Auth, useValue: mockAuth },
      ],
    });
  });

  it('allows access when user is NOT logged in', async () => {
    mockAuth.currentUser = null;
    const result = TestBed.runInInjectionContext(() => guestGuard(dummyRoute, dummyState));

    if (isObservable(result)) {
      const value = await firstValueFrom(result);
      expect(value).toBe(true);
    } else {
      expect(result).toBe(true);
    }
  });

  it('redirects to / when user is logged in', async () => {
    mockAuth.currentUser = { uid: '123' };
    const result = TestBed.runInInjectionContext(() => guestGuard(dummyRoute, dummyState));

    if (isObservable(result)) {
      await firstValueFrom(result);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    } else {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    }
  });
});
