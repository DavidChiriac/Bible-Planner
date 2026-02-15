import { inject, Injectable, signal } from '@angular/core';
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

  errors = signal<any[]>([]);
  private readonly isLoggedIn$ = new BehaviorSubject(false);

  constructor() {
    authState(this.firebase.getAuth()).subscribe(user => {
      this.isLoggedIn$.next(!!user);
    });
  }

  isLoggedIn() {
    return this.isLoggedIn$.getValue();
  }

  async login(): Promise<void> {
    this.errors.update(e => [...e, { step: 'Login clicked', native: Capacitor.isNativePlatform() }]);

    const result = Capacitor.isNativePlatform()
      ? await this.authenticateWithGoogleNative()
      : await this.authenticateWithGoogleWeb();

    this.errors.update(e => [...e, { step: 'login() result', result }]);

    if (!result.success) return;

    this.utils.fetchData();
    await this.router.navigateByUrl('/');
  }

  private async authenticateWithGoogleNative(): Promise<AuthResult> {
    try {
      const auth = this.firebase.getAuth();

      this.errors.update(e => [...e, { step: 'Native: signInWithGoogle start' }]);
      const res = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
      this.errors.update(e => [...e, { step: 'Native: signInWithGoogle resolved', res }]);

      const idToken = res.credential?.idToken ?? undefined;
      const accessToken = res.credential?.accessToken ?? undefined;

      if (!idToken && !accessToken) {
        return { success: false, error: 'Native Google sign-in returned no tokens' };
      }

      const cred = GoogleAuthProvider.credential(idToken, accessToken);
      this.errors.update(e => [...e, { step: 'Native: credential created' }]);

      const userCredential = await signInWithCredential(auth, cred);
      this.errors.update(e => [...e, { step: 'Native: Firebase sign-in ok', uid: userCredential.user.uid }]);

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      this.errors.update(e => [...e, { step: 'Native login error', message: error?.message, error }]);
      return { success: false, error: error?.message || 'Native Google login failed' };
    }
  }

  private async authenticateWithGoogleWeb(): Promise<AuthResult> {
    try {
      const auth = this.firebase.getAuth();
      const provider = new GoogleAuthProvider();

      // Optional: always show account chooser
      // provider.setCustomParameters({ prompt: 'select_account' });

      this.errors.update(e => [...e, { step: 'Web: signInWithPopup start' }]);
      const userCredential = await signInWithPopup(auth, provider);
      this.errors.update(e => [...e, { step: 'Web: popup ok', uid: userCredential.user.uid }]);

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      this.errors.update(e => [...e, { step: 'Web login error', message: error?.message, error }]);
      return { success: false, error: error?.message || 'Web Google login failed' };
    }
  }

  async logout(): Promise<void> {
  this.errors.update(e => [...e, { step: 'Logout clicked', native: Capacitor.isNativePlatform() }]);

  try {
    // 1) Sign out native provider session (only on device)
    if (Capacitor.isNativePlatform()) {
      this.errors.update(e => [...e, { step: 'Native: FirebaseAuthentication.signOut start' }]);
      await FirebaseAuthentication.signOut();
      this.errors.update(e => [...e, { step: 'Native: FirebaseAuthentication.signOut ok' }]);
    }

    // 2) Sign out Firebase session (web + native)
    this.errors.update(e => [...e, { step: 'Firebase: signOut start' }]);

    // If your FirebaseService.logout() already calls auth.signOut(), keep using it:
    await this.firebase.logout();

    this.errors.update(e => [...e, { step: 'Firebase: signOut ok' }]);

    // 3) Navigate back to login
    await this.router.navigate(['/login']);
    this.errors.update(e => [...e, { step: 'Navigated to /login' }]);

  } catch (error: any) {
    this.errors.update(e => [...e, { step: 'Logout error', message: error?.message, error }]);
  }
}

}
