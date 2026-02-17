import { Component, computed, inject, signal } from '@angular/core';
import CRONOLOGIC from '../../../assets/jsons/plan_biblie_cronologic_cornilescu_pe_zile.json';
import INORDINE from '../../../assets/jsons/plan_biblie_in_ordine_pe_saptamani.json';
import { AuthService } from '../../shared/services/auth.service';
import { Utils } from '../../shared/services/utils.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { TagModule } from 'primeng/tag';

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
    TagModule,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  utils = inject(Utils);
  auth = inject(AuthService);
  firebase = inject(FirebaseService);

  tabs = [TABS.CRONOLOGIC, TABS.INORDINE];
  selectedTab = signal(this.utils.selectedPlan());

  weeks = computed(() => {
    return this.selectedTab() === TABS.CRONOLOGIC ? CRONOLOGIC : INORDINE;
  });

  numbersOfDaysRead = computed(() => {
    let readDays = 0;

    for (const day of this.weeks().flatMap((p) => p.days)) {
      if (
        day.chapters.every((chapter: string) =>
          this.utils.readSet().has(chapter)
        )
      ) {
        readDays++;
      }
    }
    return readDays;
  });

  currentStatus = computed(() => {
    const today = new Date();
    const start = this.utils.startDate() ?? new Date();

    const diffInMs = today.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    return this.numbersOfDaysRead() - (diffInDays * 12) / this.utils.months()!;
  });

  openWeeks = signal<number[]>([]);

  private lastNavigatedWeek = 0;

  changeTab(tab: TABS) {
    this.openWeeks.set([]);
    this.selectedTab.set(tab);

    this.firebase.setSelectedPlan(tab);
  }

  addWeekToOpen(week: number) {
    if (!this.openWeeks().includes(week)) {
      this.openWeeks.update((weeks) => [...weeks, week]);
    }
  }

  goToDay(chapters: string[]) {
    const chapterToGo = chapters.find(
      (chapter) => !this.utils.readSet().has(chapter)
    );
    if (chapterToGo) {
      const book = chapterToGo.split('-')[0];
      const chapter = chapterToGo.split('-')[1];
      globalThis.location.href = `/books/${book}#${chapter}`;
    }
  }

  private afterRender(fn: () => void) {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  goToNextTargetWeek(): void {
    const weeks = [...this.weeks()];
    if (!weeks.length) return;

    weeks.sort((a, b) => a.week - b.week);

    const totalOf = (w: any) => w.days.length;
    const readOf = (w: any) => this.utils.countDaysReadInAWeek(w);

    const candidates: any[] = [];

    for (let i = 0; i < weeks.length; i++) {
      const w = weeks[i];
      const read = readOf(w);
      const total = totalOf(w);

      const isCompleted = read === total;
      const isPartial = read > 0 && read < total;

      // 1️⃣ Add completed weeks
      if (isCompleted) {
        candidates.push(w);
        continue;
      }

      // 2️⃣ Add ONLY first week of a partial streak
      if (isPartial) {
        const prev = weeks[i - 1];
        const prevIsPartial =
          prev && readOf(prev) > 0 && readOf(prev) < totalOf(prev);

        if (!prevIsPartial) {
          candidates.push(w);
        }
      }
    }

    if (candidates.length === 0) return;

    // 🔁 Endless cycling
    const next =
      candidates.find((w) => w.week > this.lastNavigatedWeek) ?? candidates[0];

    this.lastNavigatedWeek = next.week;

    this.addWeekToOpen(next.week);

    this.afterRender(() => {
      const el = document.getElementById(`week-${next.week}`);
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.scrollY - 60;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
