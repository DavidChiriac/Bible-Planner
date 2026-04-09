import { Component, computed, inject, signal } from '@angular/core';
import CRONOLOGIC from '../../../assets/jsons/plan_biblie_cronologic_cornilescu_pe_zile.json';
import INORDINE from '../../../assets/jsons/plan_biblie_in_ordine_pe_saptamani.json';
import { Utils } from '../../shared/services/utils.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Router, RouterLink } from '@angular/router';
import { ProgressBar } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../shared/services/i18n.service';

export enum TABS {
  CRONOLOGIC = 'Cronologic',
  INORDINE = 'În ordine',
  PERSONALIZAT = 'Personalizat',
}

@Component({
  selector: 'app-plans',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AccordionModule,
    CheckboxModule,
    ButtonModule,
    NgClass,
    TagModule,
    ProgressBar,
    RouterLink,
    TooltipModule
  ],
  templateUrl: './plans.html',
  styleUrl: './plans.scss',
})
export class Plans {
  utils = inject(Utils);
  i18n = inject(I18nService);
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);

  tabs = [TABS.CRONOLOGIC, TABS.INORDINE, TABS.PERSONALIZAT];

  weeks = computed(() => {
    const plan = this.utils.selectedPlan();
    if (plan === TABS.CRONOLOGIC) return CRONOLOGIC;
    if (plan === TABS.PERSONALIZAT) return this.utils.customPlan();
    return INORDINE;
  });

  numbersOfDaysRead = computed(() => {
    let readDays = 0;

    for (const day of this.weeks().flatMap((p) => p.days)) {
      if (day.chapters.every((chapter: string) => this.utils.readSet().has(chapter))) {
        readDays++;
      }
    }

    return readDays;
  });

  currentStatus = computed(() => {
    const today = new Date();
    const start = this.utils.activeStartDate() ?? new Date();

    const diffInMs = today.getTime() - start.getTime();
    const diffInDays =
      Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    const expectedPerDay = this.utils.selectedPlan() === TABS.PERSONALIZAT
      ? (this.utils.customPlanConfig()?.places ?? 1)
      : (12 / this.utils.months()!);

    return Math.round(this.numbersOfDaysRead() - diffInDays * expectedPerDay);
  });

  openWeeks = signal<number[]>([]);
  private readonly lastNavigatedWeek = signal(0);

  bookmarkedWeeksForPlan = computed(() => {
    const plan = this.utils.selectedPlan();

    const weeks = this.utils
      .favouriteWeeks()
      .filter((f) => f.plan === plan)
      .map((f) => f.week);

    return [...new Set(weeks)].sort((a, b) => a - b);
  });

  changeTab(tab: TABS) {
    if (tab === TABS.PERSONALIZAT && !this.utils.customPlanConfig()) {
      this.router.navigate(['/plan-builder']);
      return;
    }
    this.openWeeks.set([]);
    this.utils.selectedPlan.set(tab);
    this.lastNavigatedWeek.set(0);
    this.firebase.setSelectedPlan(tab);
  }

  addWeekToOpen(week: number) {
    if (!this.openWeeks().includes(week)) {
      this.openWeeks.update((weeks) => [...weeks, week]);
    }
  }

  goToDay(dayIndex: number , tab: {week: number}) {
    this.router.navigate(['/day'], { queryParams: { day: dayIndex, week: tab.week, plan: this.utils.selectedPlan() } });
  }

  private afterRender(fn: () => void) {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  hasTargetWeek = computed(() => {
    if (this.bookmarkedWeeksForPlan().length > 0) return true;
    return this.weeks().some((w) => this.utils.countDaysReadInAWeek(w) < w.days.length);
  });

  goToNextTargetWeek(): void {
    const bookmarked = this.bookmarkedWeeksForPlan();

    if (bookmarked.length) {
      const last = this.lastNavigatedWeek();
      const nextWeek = bookmarked.find((w) => w > last) ?? bookmarked[0];
      this.scrollToWeek(nextWeek);
      return;
    }

    const allWeeks = this.weeks();

    const firstStarted = allWeeks.find((w) => {
      const read = this.utils.countDaysReadInAWeek(w);
      return read > 0 && read < w.days.length;
    });

    if (firstStarted) {
      this.scrollToWeek(firstStarted.week);
      return;
    }

    const firstUnstarted = allWeeks.find(
      (w) => this.utils.countDaysReadInAWeek(w) === 0
    );

    if (firstUnstarted) {
      this.scrollToWeek(firstUnstarted.week);
    }
  }

  private scrollToWeek(weekNumber: number): void {
    this.lastNavigatedWeek.set(weekNumber);

    this.afterRender(() => {
      const el = document.getElementById(`week-${weekNumber}`);
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }

  scrollToTop(): void {
    this.lastNavigatedWeek.set(0);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async removeBookmark(tab: { week: number }) {
    const current = this.utils.favouriteWeeks();

    const updated = current.filter(
      (fav) =>
        !(
          fav.plan === this.utils.selectedPlan() &&
          fav.week === tab.week
        )
    );

    this.utils.favouriteWeeks.set(updated);

    await this.firebase.deleteFavouriteWeek(
      this.utils.selectedPlan()!,
      tab.week
    );
  }

  async addBookmark(tab: { week: number }) {
    const current = this.utils.favouriteWeeks();

    if (
      !current.some(
        (fav) =>
          fav.plan === this.utils.selectedPlan() &&
          fav.week === tab.week
      )
    ) {
      this.utils.favouriteWeeks.set([
        ...current,
        {
          plan: this.utils.selectedPlan()!,
          week: tab.week,
        },
      ]);
    }

    await this.firebase.addFavouriteWeek(
      this.utils.selectedPlan()!,
      tab.week
    );
  }

  async toggleDay(event: Event, chapters: string[]) {
    event.stopPropagation();
    await this.utils.setEntireDayRead(chapters);
  }

  toggleChapter(event: Event, chapter: string) {
    event.stopPropagation();
    this.utils.toggleChapterRead(chapter);
  }

  readChapter(chapter: string) {
    this.router.navigate(['/reader'], { queryParams: { chapter } });
  }

  readFirstUnread(chapters: string[]) {
    const first = chapters.find(ch => !this.utils.isChapterRead(ch)) ?? chapters[0];
    this.readChapter(first);
  }

  goToChapterNotes(chapter: string) {
    this.router.navigate(['/day'], { queryParams: { chapter } });
  }
}