import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { from, map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return from(auth.authStateReady()).pipe(
    map(() => {
      const user = auth.currentUser;
      return user ? true : router.createUrlTree(['/login']);
    })
  );
};
