import { Component, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  items = [
    {
      label: 'Acasă',
      icon: 'pi pi-home',
      routerLink: '/home',
    },
    {
      label: 'Cărți',
      icon: 'pi pi-book',
      routerLink: '/books',
    },
    {
      label: 'Setări',
      icon: 'pi pi-cog',
      routerLink: '/settings',
    },
  ];

  auth = inject(AuthService);
}
