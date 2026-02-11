import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  imports: [ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  auth = inject(AuthService);
}
