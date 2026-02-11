import { inject, Injectable, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { take } from 'rxjs';
import { TABS } from '../../pages/home-page/home-page';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  readSet = signal(new Set<string>());
  loading = signal(true);
  startDate = signal('');
  months = signal<number | null>(null);
  selectedPlan = signal<TABS>(TABS.CRONOLOGIC);

  private readonly firebase = inject(FirebaseService);

  constructor() {
    this.firebase
      .getChapters()
      .pipe(take(1))
      .subscribe((chapters) => {
        this.readSet.set(new Set(chapters ?? []));
        this.loading.set(false);
      });

    this.getStartDate();
    this.getMonths();
    this.getSelectedPlan();
  }

  getStartDate() {
    this.firebase
      .getStartDate()
      .pipe(take(1))
      .subscribe((date) => {
        if (date?.length > 0) {
          this.startDate.set(date);
        }
      });
  }

  getMonths() {
    this.firebase
      .getMonths()
      .pipe(take(1))
      .subscribe((months) => {
        if (months) {
          this.months.set(months);
        }
      });
  }

  getSelectedPlan() {
    return this.firebase.getPlan().pipe(take(1)).subscribe(plan => {
      if (plan) {
        this.selectedPlan.set(plan);
      }
    });
  }

  toggleChapter(chapter: string) {
    if (this.readSet().has(chapter)) {
      this.firebase.deleteChapters([chapter]);
      const newSet = new Set(this.readSet());
      newSet.delete(chapter);
      this.readSet.set(newSet);
    } else {
      this.firebase.addChapters([chapter]);
      const newSet = new Set(this.readSet());
      newSet.add(chapter);
      this.readSet.set(newSet);
    }
  }

  isSelected = (chapter: string) => this.readSet().has(chapter);

  isEntireDayRead = (dayChapters: string[]) =>
    dayChapters.every((chapter) => this.readSet().has(chapter));

  setEntireDayRead(chapters: string[]) {
    const value = !this.isEntireDayRead(chapters);
    if (value) {
      this.firebase.addChapters(chapters);
      this.readSet.set(new Set([...this.readSet(), ...chapters]));
    } else {
      this.firebase.deleteChapters(chapters);
      this.readSet.set(
        new Set([...this.readSet()].filter((c) => !chapters.includes(c))),
      );
    }
  }

  isChapterRead(chapter: string) {
    return this.readSet().has(chapter)
  }

  markAllAsRead(chapters: string[]) {
    this.firebase.addChapters(chapters);
    this.readSet.set(new Set([...this.readSet(), ...chapters]));
  }

  markAllAsUnread(chapters: string[]) {
    this.firebase.deleteChapters(chapters);
    this.readSet.set(new Set([...this.readSet()].filter((c) => !chapters.includes(c))));
  }

  countDaysReadInAWeek(week: { days: { chapters: string[] }[] }) {
    let readDays = 0;

    for (const day of week.days) {
      if (
        day.chapters.every((chapter: string) =>
          this.readSet().has(chapter),
        )
      ) {
        readDays++;
      }
    }
    return readDays;
  }
}
