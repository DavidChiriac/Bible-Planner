import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-settings',
  imports: [ButtonModule, InputTextModule, FloatLabelModule, FormsModule, DialogModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly utils = inject(Utils);
  private readonly firebase = inject(FirebaseService);

  resetConfirmationVisible = false;

  startDate = this.utils.startDate();
  months = this.utils.months();

  setStartDate(date: string) {
    if (!date) {
      return;
    }
    this.firebase.setStartDate(date);
    this.utils.startDate.set(date);
  }

  setMonths(months: number) {
    if (!months) {
      return;
    }
    this.firebase.setMonths(months);
    this.utils.months.set(months);
  }

  resetProgress() {
    this.resetConfirmationVisible = true;
  }

  confirmResetProgress() {
    this.resetConfirmationVisible = false;

    this.firebase.resetProgress()
      .then(() => {
        this.utils.readSet.set(new Set());
      })
      .catch(err => alert('Error resetting progress: ' + err.message));
  }
}
