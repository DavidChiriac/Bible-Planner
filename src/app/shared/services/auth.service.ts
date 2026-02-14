import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authState } from '@angular/fire/auth';

import { Capacitor } from '@capacitor/core';
import { SocialLogin, GoogleLoginOptions, GoogleLoginResponseOnline } from '@capgo/capacitor-social-login';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';

import { FirebaseService } from './firebase.service';
import { Utils } from './utils.service';

type AuthResult = { success: boolean; error?: string; user?: any };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly utils = inject(Utils);

  private readonly isLoggedIn$ = new BehaviorSubject(false);

  private socialLoginInitialized = false;

  private readonly webClientId =
    '820329179054-2uem7c7j3lb6ukr0lvu6uqle0avqouia.apps.googleusercontent.com';

  constructor() {
    authState(this.firebase.getAuth()).subscribe(user => {
      this.isLoggedIn$.next(!!user);
    });
  }

  async login(): Promise<void> {
    const result = await this.authenticateWithGoogle();

    if (!result.success) {
      console.error('Login failed:', result.error);
      return;
    }

    // If this is async (Observable/Promise), handle it accordingly
    this.utils.fetchData();

    await this.router.navigate(['']);
  }

  async logout(): Promise<void> {
    try {
      // Native plugin logout (optional but recommended)
      if (Capacitor.isNativePlatform()) {
        try {
          await SocialLogin.logout({ provider: 'google' });
        } catch {
          // Some versions/devices may not support explicit logout; ignore.
        }
      }

      await this.firebase.logout();
      await this.router.navigate(['/login']);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }

  isLoggedIn(): boolean {
    return this.isLoggedIn$.getValue();
  }

  // ---------------------------
  // Google Auth (Web + Native)
  // ---------------------------
  private async authenticateWithGoogle(): Promise<AuthResult> {
    try {
      const platform = Capacitor.getPlatform();
      const auth = this.firebase.getAuth();

      // WEB: Firebase popup sign-in
      if (platform === 'web') {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');

        const userCredential = await signInWithPopup(auth, provider);
        return { success: true, user: userCredential.user };
      }

      // NATIVE: SocialLogin -> idToken -> Firebase credential
      await this.ensureSocialLoginInitialized(platform);

      const response = await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['email', 'profile'] } as GoogleLoginOptions,
      });

      if (response.result.responseType !== 'online') {
        return { success: false, error: 'Offline mode not supported. Please use online mode.' };
      }

      const googleResponse = response.result as GoogleLoginResponseOnline;
      const idToken = googleResponse.idToken;

      if (!idToken) {
        return { success: false, error: 'Failed to get Google ID token' };
      }

      // Optional debug: audience check (helps diagnose hangs/misconfig)
      const tokenAudience = this.tryReadAudience(idToken);
      const expectedAudience = this.webClientId;
      if (tokenAudience && tokenAudience !== expectedAudience) {
        console.warn(
          `Token audience mismatch! Expected: ${expectedAudience}, Got: ${tokenAudience}. ` +
          `Token should be issued for the WEB client ID.`
        );
      }

      const credential = GoogleAuthProvider.credential(idToken);

      // Timeout guard (prevents “hang forever”)
      const signInPromise = signInWithCredential(auth, credential);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase sign-in timeout after 30 seconds')), 30000)
      );

      const userCredential = (await Promise.race([signInPromise, timeoutPromise])) as any;

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('Google authentication error:', error);
      return { success: false, error: error?.message || 'Google authentication failed' };
    }
  }

  private async ensureSocialLoginInitialized(platform: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (this.socialLoginInitialized) return;

    await SocialLogin.initialize({
      google: {
        webClientId: this.webClientId,
        mode: 'online',
      },
    });

    this.socialLoginInitialized = true;
  }

  private tryReadAudience(idToken: string): string | null {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) return null;
      const payloadJson = atob(parts[1]);
      const payload = JSON.parse(payloadJson);
      return payload?.aud ?? null;
    } catch {
      return null;
    }
  }
}
