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

    const readOf = (w: any) => this.utils.countDaysReadInAWeek(w);
    const totalOf = (w: any) => w.days.length;

    const isCompleted = (w: any) => readOf(w) === totalOf(w);
    const isUnstarted = (w: any) => readOf(w) === 0;
    const isPartial = (w: any) => {
      const r = readOf(w);
      const t = totalOf(w);
      return r > 0 && r < t;
    };

    const candidates: any[] = [];

    for (let i = 0; i < weeks.length; i++) {
      const w = weeks[i];

      // ✅ Candidate A: completed week whose next week is unstarted
      if (i < weeks.length - 1) {
        const next = weeks[i + 1];
        if (isCompleted(w) && isUnstarted(next)) {
          candidates.push(w);
          continue;
        }
      }

      // 🔄 Candidate B: first week of a partial block
      if (isPartial(w)) {
        const prev = weeks[i - 1];
        const prevIsPartial = prev ? isPartial(prev) : false;
        if (!prevIsPartial) {
          candidates.push(w);
        }
      }
    }

    if (candidates.length === 0) return;

    // 🔁 Endless cycling relative to last navigated target
    const nextTarget =
      candidates.find((w) => w.week > this.lastNavigatedWeek) ?? candidates[0];

    this.lastNavigatedWeek = nextTarget.week;

    this.afterRender(() => {
      const el = document.getElementById(`week-${nextTarget.week}`);
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.scrollY - 60;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    });
  }

  scrollToTop(): void {
    this.lastNavigatedWeek = 0;
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
