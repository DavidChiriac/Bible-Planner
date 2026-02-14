import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const auth = inject(Auth);

  if (!isPlatformBrowser(platformId)) return true;

  return user(auth).pipe(
    take(1),
    map(u => (u ? true : router.createUrlTree(['/login'])))
  );
};
