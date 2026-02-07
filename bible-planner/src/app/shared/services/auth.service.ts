import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);

  login() {
    this.firebase.loginWithGoogle().then(() => {
        this.router.navigate(['/']);
    });
  }

  logout() {
    this.firebase.logout().then(() => {
        this.router.navigate(['/login']);
    });
  }

  isLoggedIn() {
    return this.firebase.user$;
  }
}
