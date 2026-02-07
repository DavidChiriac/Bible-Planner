import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Utils } from './shared/services/utils.service';
import { AuthService } from './shared/services/auth.service';
import { HomePage } from './home-page/home-page';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [HomePage, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'bible-planner';

  utils = inject(Utils);
  auth = inject(AuthService);
}
