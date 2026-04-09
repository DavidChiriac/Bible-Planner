import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { ThemeService } from '../../shared/services/theme.service';
import { I18nService } from '../../shared/services/i18n.service';
import { Lang } from '../../shared/i18n/translations';
import { TABS } from '../plans/plans';
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
  theme = inject(ThemeService);
  i18n = inject(I18nService);
  private readonly firebase = inject(FirebaseService);

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

  confirmDeleteCustomPlan() {
    this.deletePlanVisible = false;

    this.firebase.deleteCustomPlanConfig()
      .then(() => {
        this.utils.customPlanConfig.set(null);
        if (this.utils.selectedPlan() === TABS.PERSONALIZAT) {
          this.utils.selectedPlan.set(TABS.CRONOLOGIC);
          this.firebase.setSelectedPlan(TABS.CRONOLOGIC);
        }
      })
      .catch(err => alert('Error deleting custom plan: ' + err.message));
  }
}
