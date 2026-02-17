import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-settings',
  imports: [ButtonModule, InputTextModule, FloatLabelModule, FormsModule, DialogModule, DatePickerModule, NgClass],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  utils = inject(Utils);
  private readonly firebase = inject(FirebaseService);

  resetConfirmationVisible = false;

  setStartDate(date: Date | null) {
    if (!date) return;

    const iso =
      `${date.getFullYear()}-` +
      `${String(date.getMonth() + 1).padStart(2, '0')}-` +
      `${String(date.getDate()).padStart(2, '0')}`;
      
    this.firebase.setStartDate(iso);

    this.utils.startDate.set(this.utils.startDateAsDate(iso));
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
