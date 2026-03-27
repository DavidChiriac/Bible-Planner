import { Component, computed, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Utils } from '../../services/utils.service';
import { NgClass } from '@angular/common';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-navbar',
  imports: [MenubarModule, ButtonModule, NgClass],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  auth = inject(AuthService);
  utils = inject(Utils);
  i18n = inject(I18nService);

  computedItems = computed(() => {
    const allItems = [
      {
        label: this.i18n.t('nav.home'),
        icon: 'pi pi-home',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true }
      },
      { separator: true },
      {
        label: this.i18n.t('nav.books'),
        icon: 'pi pi-book',
        routerLink: '/books',
      },
      { separator: true },
      {
        label: this.i18n.t('nav.notes'),
        icon: 'pi pi-pencil',
        routerLink: '/notes',
      },
      { separator: true },
      {
        label: this.i18n.t('nav.settings'),
        icon: 'pi pi-cog',
        routerLink: '/settings',
      },
      {
        label: this.i18n.t('nav.logout'),
        icon: 'pi pi-sign-out',
        command: () => this.auth.logout(),
      },
    ];

    if (this.utils.isMobile()) {
      return allItems.filter(item => !item.separator);
    }
    return allItems;
  });
}
