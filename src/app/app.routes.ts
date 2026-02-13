import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';
import { HomePage } from './pages/home-page/home-page';
import { Login } from './pages/login/login';
import { Settings } from './pages/settings/settings';
import { Books } from './pages/books/books';
import { BookChapters } from './pages/books/book-chapters/book-chapters';

export const routes: Routes = [
    { path: '', component: HomePage, canActivate: [authGuard], pathMatch: 'full' },
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'settings', component: Settings, canActivate: [authGuard] },
    { path: 'books', component: Books, canActivate: [authGuard] },
    { path: 'books/:id', component: BookChapters, canActivate: [authGuard] },
];
