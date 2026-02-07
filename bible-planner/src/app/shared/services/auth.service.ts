import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firebase = inject(FirebaseService);

  login() {
    this.firebase.loginWithGoogle();
  }
  logout() {
    this.firebase.logout().then(() => {
      alert('Logged out successfully');
    });
  }

  isLoggedIn() {
    return this.firebase.user$;
  }
}
