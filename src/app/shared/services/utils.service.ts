import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { combineLatest, distinctUntilChanged, EMPTY, from, switchMap } from 'rxjs';
import { TABS } from '../../pages/home-page/home-page';
import { isPlatformBrowser } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { authState } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  readSet = signal(new Set<string>());
  loading = signal(true);
  startDate = signal<Date | null>(null);
  months = signal<number | null>(null);
  selectedPlan = signal<TABS | undefined>(undefined);
  favouriteWeeks = signal<{plan: TABS, week: number}[]>([]);

  private readonly firebase = inject(FirebaseService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  
  isMobile = signal<boolean | null>(null);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    authState(this.firebase.getAuth()).pipe(
      takeUntilDestroyed(this.destroyRef),
      // only react when uid actually changes
      distinctUntilChanged((a, b) => a?.uid === b?.uid),
      switchMap((u) => {
        if (!u) {
          this.reset();                 // clear signals
          return EMPTY;                 // IMPORTANT: cancels DB listeners
        }

        this.loading.set(true);

        // migrate then start DB listeners
        return from(this.firebase.ensureChaptersMigrated()).pipe(
          switchMap(() =>
            combineLatest({
              chapters: this.firebase.getChapters(),
              startDate: this.firebase.getStartDate(),
              months: this.firebase.getMonths(),
              plan: this.firebase.getPlan(),
              favouriteWeeks: this.firebase.getFavouriteWeeks(),
            })
          ),
        );
      })
    )
    .subscribe(({ chapters, startDate, months, plan, favouriteWeeks }) => {
      // update UI state
      this.readSet.set(new Set(chapters ?? []));

      if (startDate !== undefined) {
        // exists in DB -> use it (even if empty string, though you likely never store empty)
        this.startDate.set(this.startDateAsDate(startDate));
      } else {
        // truly missing -> set default
        this.firebase.setStartDate(new Date().toISOString().split('T')[0]);
      }

      if (months !== undefined) {
        this.months.set(months);
      } else {
        this.firebase.setMonths(12);
      }

      if (plan !== undefined && plan !== null) {
        this.selectedPlan.set(plan);
      } else {
        this.firebase.setSelectedPlan(TABS.INORDINE);
      }

      if (favouriteWeeks !== undefined && favouriteWeeks !== null) {
        this.favouriteWeeks.set(favouriteWeeks);
      } else {
        this.favouriteWeeks.set([]);
      }

      this.loading.set(false);
    });

    this.breakpointObserver.observe('(max-width: 767px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile.set(state.matches);
      });
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

  countDaysReadInAWeek(week: { week: number, days: { chapters: string[] }[] }) {
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

  isTablet() {
    return this.deviceService.isTablet();
  }

  startDateAsDate(date: string): Date | null {
    const s = date;
    if (!s) return null;

    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  hasReadWholeBible() {
    const readChapters = this.readSet();
    const totalChapters = 1189;
    return readChapters.size === totalChapters;
  }

  reset() {
    this.readSet.set(new Set());
    this.months.set(null);
    this.selectedPlan.set(undefined);
    this.loading.set(false);
  }

  isWeekFavourite(week: { week: number }) {
    return this.favouriteWeeks().some(fav => fav.plan === this.selectedPlan() && fav.week === week.week);
  }
}
