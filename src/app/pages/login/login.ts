import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { Utils } from '../../shared/services/utils.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ButtonModule, NgClass],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  auth = inject(AuthService);
  utils = inject(Utils);
}
