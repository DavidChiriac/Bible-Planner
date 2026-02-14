import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authState } from '@angular/fire/auth';
import { Utils } from './utils.service';

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

  login() {
    this.firebase.loginWithGoogle().then(() => {
        this.utils.fetchData();
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
