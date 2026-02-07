import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Utils } from './shared/services/utils.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'bible-planner';

  utils = inject(Utils);
}
