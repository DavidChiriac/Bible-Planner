import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home-page/home-page').then(m => m.HomePage), canActivate: [authGuard] },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login), canActivate: [guestGuard] },
    { path: 'settings', loadComponent: () => import('./pages/settings/settings').then(m => m.Settings), canActivate: [authGuard] },
    { path: 'books', loadComponent: () => import('./pages/books/books').then(m => m.Books), canActivate: [authGuard] },
    { path: 'books/:id', loadComponent: () => import('./pages/books/book-chapters/book-chapters').then(m => m.BookChapters), canActivate: [authGuard] },
];
