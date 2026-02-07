import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import CHAPTERS from '../../../assets/cornilescu_prefix_carte_capitol.json';
import { Utils } from '../shared/services/utils.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [NgClass],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  auth = inject(AuthService);
  utils = inject(Utils);

  CHAPTERS = CHAPTERS;
}
