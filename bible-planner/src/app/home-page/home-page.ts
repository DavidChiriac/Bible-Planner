import { Component, inject } from '@angular/core';
import CHAPTERS from '../../../assets/cornilescu_prefix_carte_capitol.json';
import { AuthService } from '../shared/services/auth.service';
import { Utils } from '../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { FirebaseService } from '../shared/services/firebase.service';

@Component({
  selector: 'app-home-page',
  imports: [NgClass],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  CHAPTERS = CHAPTERS;
  utils = inject(Utils);
  auth = inject(AuthService);
  firebase = inject(FirebaseService);

  resetProgress() {
    this.firebase.resetProgress()
      .then(() => {
        this.utils.readSet.set(new Set());
      })
      .catch(err => alert('Error resetting progress: ' + err.message));
  }
}
