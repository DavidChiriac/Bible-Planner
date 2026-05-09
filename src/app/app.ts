import { ChangeDetectionStrategy, Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { Utils } from './shared/services/utils.service';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { AuthService } from './shared/services/auth.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Location, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'bible-agenda';

  utils = inject(Utils);
  auth = inject(AuthService);
  private readonly location = inject(Location);
  private readonly platformId = inject(PLATFORM_ID);

  isOnline = signal(true);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);
      globalThis.addEventListener('online', () => this.isOnline.set(true));
      globalThis.addEventListener('offline', () => this.isOnline.set(false));
    }

    if (Capacitor.getPlatform() === 'android') {
      void App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
        if (canGoBack) {
          globalThis.history.back();
        } else {
          App.exitApp();
        }
      });
    }
  }
}
