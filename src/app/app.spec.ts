import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal, PLATFORM_ID } from '@angular/core';
import { AppComponent } from './app';
import { Utils } from './shared/services/utils.service';
import { AuthService } from './shared/services/auth.service';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';

jest.mock('@angular/fire/auth', () => ({
  authState: jest.fn(() => ({ subscribe: jest.fn() })),
}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: jest.fn().mockReturnValue('web'), isNativePlatform: jest.fn().mockReturnValue(false) },
  registerPlugin: jest.fn(() => ({ updateWidget: jest.fn() })),
}));
jest.mock('@capacitor/app', () => ({
  App: { addListener: jest.fn() },
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

@Component({ selector: 'app-navbar', template: '', standalone: true })
class NavbarStub {}

@Component({ selector: 'app-footer', template: '', standalone: true })
class FooterStub {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        {
          provide: Utils,
          useValue: {
            isMobile: signal(false),
            loading: signal(false),
            readSet: signal(new Set<string>()),
          },
        },
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
        { provide: Location, useValue: { back: jest.fn() } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [Navbar, Footer] },
        add: { imports: [NavbarStub, FooterStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has title "bible-agenda"', () => {
    expect(fixture.componentInstance.title).toBe('bible-agenda');
  });

  it('isOnline defaults to true', () => {
    expect(fixture.componentInstance.isOnline()).toBe(true);
  });
});
