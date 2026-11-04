import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';
import { Lang } from '../../shared/i18n/translations';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-settings',
  imports: [ButtonModule, FormsModule, DialogModule, NgClass],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  utils = inject(Utils);
  i18n = inject(I18nService);
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);

  setLanguage(lang: Lang) {
    this.i18n.setLang(lang);
  }

  resetConfirmationVisible = false;
  deletePlanVisible = false;

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

  deleteCustomPlan() {
    this.deletePlanVisible = true;
  }

  async confirmDeleteCustomPlan() {
    this.deletePlanVisible = false;

    try {
      await this.firebase.resetProgress();
      this.utils.readSet.set(new Set());
      this.utils.favouriteWeeks.set([]);
      this.utils.startDate.set(null);
      this.utils.months.set(null);

      await this.firebase.deleteCustomPlanConfig();
      this.utils.customPlanConfig.set(null);
      await this.router.navigate(['/plan-builder']);
    } catch (err) {
      alert('Error deleting custom plan and resetting progress: ' + (err instanceof Error ? err.message : String(err)));
    }
  }
}
