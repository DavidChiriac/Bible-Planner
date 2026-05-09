import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Login } from './login';
import { AuthService } from '../../shared/services/auth.service';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';

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
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithCredential: jest.fn(),
  signInWithPopup: jest.fn(),
}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let mockAuth: { login: jest.Mock };

  beforeEach(async () => {
    mockAuth = { login: jest.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: Utils, useValue: { isMobile: signal(false) } },
        { provide: I18nService, useValue: { t: (key: string) => key } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders login title', () => {
    expect(fixture.nativeElement.textContent).toContain('login.title');
  });

  it('has a login button', () => {
    const btn = fixture.nativeElement.querySelector('p-button');
    expect(btn).toBeTruthy();
  });
});
