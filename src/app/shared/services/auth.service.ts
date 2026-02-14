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
import { environment } from '../../../environments/environment';

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
      return;
    }

    this.utils.fetchData();
    await this.router.navigateByUrl('/');
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
      const auth = this.firebase.getAuth();

      if (Capacitor.isNativePlatform()) {
        const res = await FirebaseAuthentication.signInWithGoogle();

        const idToken = res.credential?.idToken ?? undefined;
        const accessToken = res.credential?.accessToken ?? undefined;

        if (!idToken && !accessToken) {
          return { success: false, error: 'Google sign-in returned no tokens, cannot sign into Firebase.' };
        }

        const cred = GoogleAuthProvider.credential(idToken, accessToken);
        const userCredential = await signInWithCredential(auth, cred);

        return { success: true, user: userCredential.user };
      }

      const res = await FirebaseAuthentication.signInWithGoogle();

      // Depending on platform/plugin version, tokens may be here:
      const idToken = res.credential?.idToken;
      const accessToken = res.credential?.accessToken;

      // GoogleAuthProvider.credential(idToken, accessToken)
      const cred = GoogleAuthProvider.credential(idToken ?? undefined, accessToken ?? undefined);

      if (!idToken && !accessToken) {
        throw new Error('No Google token returned (idToken/accessToken missing)');
      }

      await signInWithCredential(this.firebase.getAuth(), cred);
      return { success: true };

    } catch (error: any) {
      return { success: false, error: error?.message || 'Google authentication failed' };
    }
  }
}
