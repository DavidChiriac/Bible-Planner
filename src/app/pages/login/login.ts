import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Button } from 'primeng/button';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-login',
  imports: [Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  auth = inject(AuthService);
  utils = inject(Utils);
  i18n = inject(I18nService);
}
