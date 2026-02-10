import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-settings',
  imports: [ButtonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly utils = inject(Utils);
  private readonly firebase = inject(FirebaseService);

    resetProgress() {
      this.firebase.resetProgress()
        .then(() => {
          this.utils.readSet.set(new Set());
        })
        .catch(err => alert('Error resetting progress: ' + err.message));
    }
}
