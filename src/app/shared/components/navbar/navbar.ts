import { Component, computed, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Utils } from '../../services/utils.service';
import { NgClass } from '@angular/common';
import { SyncIndicator } from '../sync-indicator/sync-indicator';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, ButtonModule, NgClass, SyncIndicator],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  items = [
    {
      label: 'Acasă',
      icon: 'pi pi-home',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true }
    },
    {
      separator: true
    },
    {
      label: 'Cărți',
      icon: 'pi pi-book',
      routerLink: '/books',
    },
    {
      separator: true
    },
    {
      label: 'Note',
      icon: 'pi pi-pencil',
      routerLink: '/notes',
    },
    {
      separator: true
    },
    {
      label: 'Setări',
      icon: 'pi pi-cog',
      routerLink: '/settings',
    },
    {
      label: 'Deconectare',
      icon: 'pi pi-sign-out',
      command: () => this.auth.logout(),
    }
  ];

  computedItems = computed(() => {
    if (this.utils.isMobile()) {
      return this.items.filter(item => !item.separator);
    }

    return this.items;
  });

  auth = inject(AuthService);
  utils = inject(Utils);

  constructor() {
    if (this.utils.isMobile()) {
      this.items = this.items.filter(item => !item.separator);
    }
  }
}
