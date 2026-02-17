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

  isLoggedIn() {
    return this.isLoggedIn$.getValue();
  }

  async login(): Promise<void> {
    const result = Capacitor.isNativePlatform()
      ? await this.authenticateWithGoogleNative()
      : await this.authenticateWithGoogleWeb();

    if (!result.success) return;
    this.isLoggedIn$.next(true);
    await this.router.navigateByUrl('/');
  }

  private async authenticateWithGoogleNative(): Promise<AuthResult> {
    try {
      const auth = this.firebase.getAuth();

      const res = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });

      const idToken = res.credential?.idToken ?? undefined;
      const accessToken = res.credential?.accessToken ?? undefined;

      if (!idToken && !accessToken) {
        return { success: false, error: 'Native Google sign-in returned no tokens' };
      }

      const cred = GoogleAuthProvider.credential(idToken, accessToken);

      const userCredential = await signInWithCredential(auth, cred);

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Native Google login failed' };
    }
  }

  private async authenticateWithGoogleWeb(): Promise<AuthResult> {
    try {
      const auth = this.firebase.getAuth();
      const provider = new GoogleAuthProvider();

      // Optional: always show account chooser
      // provider.setCustomParameters({ prompt: 'select_account' });

      const userCredential = await signInWithPopup(auth, provider);

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Web Google login failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      // 1) Sign out native provider session (only on device)
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut();
      }

      // 2) Sign out Firebase session (web + native)
      // If your FirebaseService.logout() already calls auth.signOut(), keep using it:
      await this.firebase.logout();

      this.utils.reset()


      // 3) Navigate back to login
      this.isLoggedIn$.next(false);
      await this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  }

}
