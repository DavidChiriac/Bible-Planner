import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authState } from '@angular/fire/auth';
import { Utils } from './utils.service';

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly isLoggedIn$ = new BehaviorSubject(false);
  private readonly utils = inject(Utils);

  constructor() {
    authState(this.firebase.getAuth()).subscribe(user => {
      this.isLoggedIn$.next(!!user);
    });
  }

  async login() {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken;

        if (!idToken) {
          throw new Error('Google sign-in did not return an idToken');
        }

        const auth = this.firebase.getAuth();
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        await this.firebase.loginWithGoogle();
      }

      this.utils.fetchData();
      this.isLoggedIn$.next(true);
      await this.router.navigate(['']);
    } catch (e) {
      console.error('Login failed:', e);
    }
  }

  async logout() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Sign out native session (Google) + Firebase web session
        await FirebaseAuthentication.signOut();
      }

      await this.firebase.logout();
      this.isLoggedIn$.next(false);
      await this.router.navigate(['/login']);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }

  isLoggedIn() {
    return this.isLoggedIn$.getValue();
  }
}
