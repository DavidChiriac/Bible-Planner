import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authState } from '@angular/fire/auth';

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
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

    this.utils.fetchData();
    await this.router.navigate(['']);
  }

  async logout(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut();
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

  private async authenticateWithGoogle(): Promise<AuthResult> {
    try {
      const res = await FirebaseAuthentication.signInWithGoogle();

      // Depending on platform/plugin version, tokens may be here:
      const idToken = res.credential?.idToken;
      const accessToken = res.credential?.accessToken;

      // GoogleAuthProvider.credential(idToken, accessToken)
      const cred = GoogleAuthProvider.credential(idToken ?? undefined, accessToken ?? undefined);

      if (!idToken && !accessToken) {
        throw new Error('No Google token returned (idToken/accessToken missing)');
      }

      const userCredential = await signInWithCredential(this.firebase.getAuth(), cred);
      return { success: true, user: userCredential.user };

    } catch (error: any) {
      console.error('Google authentication error:', error);
      return { success: false, error: error?.message || 'Google authentication failed' };
    }
  }
}
