import { Component, computed, inject, signal } from '@angular/core';
import CRONOLOGIC from '../../../../assets/plan_biblie_cronologic_cornilescu_pe_zile.json';
import INORDINE from '../../../../assets/plan_biblie_in_ordine_pe_saptamani.json';
import { AuthService } from '../../shared/services/auth.service';
import { Utils } from '../../shared/services/utils.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';

export enum TABS {
  CRONOLOGIC = 'Cronologic',
  INORDINE = 'În ordine',
}

@Component({
  selector: 'app-home-page',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AccordionModule,
    CheckboxModule,
    ButtonModule,
    NgClass,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  tabs = [TABS.CRONOLOGIC, TABS.INORDINE];
  selectedTab = signal(TABS.CRONOLOGIC);

  weeks = computed(() => {
    return this.selectedTab() === TABS.CRONOLOGIC ? CRONOLOGIC : INORDINE;
  });

  numbersOfDaysRead = computed(() => {
    let readDays = 0;

    for (const day of this.weeks().flatMap((p) => p.days)) {
      if (
        day.chapters.every((chapter: string) =>
          this.utils.readSet().has(chapter),
        )
      ) {
        readDays++;
      }
    }
    return readDays;
  });

  currentStatus = computed(() => {
    return this.numbersOfDaysRead() - (new Date().getDate() + 1 - new Date(this.utils.startDate()).getDate()) * 12 / this.utils.months()!;
  });

  openWeeks = signal<number[]>([]);

  utils = inject(Utils);
  auth = inject(AuthService);
  firebase = inject(FirebaseService);

  addWeekToOpen(week: number) {
    if (!this.openWeeks().includes(week)) {
      this.openWeeks.update((weeks) => [...weeks, week]);
    }
  }
}
