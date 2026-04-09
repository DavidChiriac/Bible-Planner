import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Utils } from './shared/services/utils.service';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { AuthService } from './shared/services/auth.service';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';

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

  async ngOnInit(): Promise<void> {
    if (Capacitor.getPlatform() === 'android') {
      await App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
        if (canGoBack) {
          globalThis.history.back();
          return;
        } else {
          App.exitApp();
          return;
        }

        this.location.back();
      });
    }
  }
}
