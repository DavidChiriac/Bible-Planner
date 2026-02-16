import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Utils } from './shared/services/utils.service';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { AuthService } from './shared/services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, ProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'bible-planner';

  utils = inject(Utils);
  auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  async ngOnInit() {
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.hide();

      await App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
        if (canGoBack) {
          globalThis.history.back();
          return;
        }

        const url = this.router.url;

        if (url === '/') {
          return;
        }

        this.location.back();
      });
    }
  }
}
