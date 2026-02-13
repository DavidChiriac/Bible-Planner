import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authState } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly isLoggedIn$ = new BehaviorSubject(false);

  constructor() {
    authState(this.firebase.getAuth()).subscribe(user => {
      this.isLoggedIn$.next(!!user);
    });
  }

  login() {
    this.firebase.loginWithGoogle().then(() => {
        this.isLoggedIn$.next(true);
        this.router.navigate(['']);
    });
  }

  logout() {
    this.firebase.logout().then(() => {
        this.isLoggedIn$.next(false);
        this.router.navigate(['/login']);
    });
  }

  isLoggedIn() {
    return this.isLoggedIn$.getValue();
  }
}
