import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { Navbar } from './navbar';
import { Utils } from '../../services/utils.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MenubarModule } from 'primeng/menubar';

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

// PrimeNG Menubar requires window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

@Component({ selector: 'p-menubar', template: '', standalone: true, inputs: ['model'] })
class MenubarStub {}

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let isMobile: ReturnType<typeof signal<boolean | null>>;
  let mockAuth: { logout: jest.Mock };
  let mockI18n: { t: jest.Mock };

  beforeEach(async () => {
    isMobile = signal<boolean | null>(false);
    mockAuth = { logout: jest.fn() };
    mockI18n = { t: jest.fn((key: string) => key) };

    await TestBed.configureTestingModule({
      imports: [Navbar, RouterTestingModule],
      providers: [
        { provide: Utils, useValue: { isMobile } },
        { provide: AuthService, useValue: mockAuth },
        { provide: I18nService, useValue: mockI18n },
      ],
    })
      .overrideComponent(Navbar, {
        remove: { imports: [MenubarModule] },
        add: { imports: [MenubarStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computedItems returns items with separators on desktop', () => {
    isMobile.set(false);
    const items = fixture.componentInstance.computedItems();
    const separators = items.filter((item: any) => 'separator' in item);
    expect(separators.length).toBeGreaterThan(0);
  });

  it('computedItems filters separators on mobile', () => {
    isMobile.set(true);
    const items = fixture.componentInstance.computedItems();
    const separators = items.filter((item: any) => 'separator' in item);
    expect(separators.length).toBe(0);
  });

  it('computedItems hides home link on mobile', () => {
    isMobile.set(true);
    const items = fixture.componentInstance.computedItems();
    const homeItem = items.find((item: any) => item.routerLink === '/');
    expect(homeItem).toBeUndefined();
  });

  it('includes logout command', () => {
    const items = fixture.componentInstance.computedItems();
    const logoutItem = items.find((item: any) => item.command);
    expect(logoutItem).toBeTruthy();
  });
});
