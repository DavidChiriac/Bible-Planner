import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./home-page/home-page').then(m => m.HomePage), pathMatch: 'full', canActivate: [authGuard] },
    { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login), canActivate: [guestGuard] },
];
