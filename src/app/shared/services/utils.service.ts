import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { combineLatest, distinctUntilChanged, EMPTY, from, switchMap } from 'rxjs';
import { TABS } from '../../pages/home-page/home-page';
import { isPlatformBrowser } from '@angular/common';
import { authState } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import ChapterWithVerses from '../../../assets/jsons/biblia_ro_capitole_cu_versete_complete.json';
import CRONOLOGIC from '../../../assets/jsons/plan_biblie_cronologic_cornilescu_pe_zile.json';
import INORDINE from '../../../assets/jsons/plan_biblie_in_ordine_pe_saptamani.json';
import { HapticsService } from './haptics.service';
import { WidgetService } from './widget.service';
import { CustomPlanConfig, PlanGeneratorService } from './plan-generator.service';
import { IPlan } from '../models/plan.model';

const TOTAL_BIBLE_VERSES = 31102;

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
  customPlanConfig = signal<CustomPlanConfig | null>(null);

  private readonly firebase = inject(FirebaseService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly haptics = inject(HapticsService);
  private readonly widget = inject(WidgetService);
  private readonly planGenerator = inject(PlanGeneratorService);
  
  isMobile = signal<boolean | null>(null);

  customPlan = computed<IPlan[]>(() => {
    const config = this.customPlanConfig();
    if (!config) return [];
    return this.planGenerator.generate(config);
  });

  activeStartDate = computed<Date | null>(() => {
    if (this.selectedPlan() === TABS.PERSONALIZAT) {
      const sd = this.customPlanConfig()?.startDate;
      return sd ? this.startDateAsDate(sd) : this.startDate();
    }
    return this.startDate();
  });

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
              favouriteWeeks: this.firebase.getFavouriteWeeks$(),
              customPlanConfig: this.firebase.getCustomPlanConfig$(),
            })
          ),
        );
      })
    )
    .subscribe(({ chapters, startDate, months, plan, favouriteWeeks, customPlanConfig }) => {
      // update UI state
      this.readSet.set(new Set(chapters ?? []));

      if (startDate) {
        // exists in DB -> use it (even if empty string, though you likely never store empty)
        this.startDate.set(this.startDateAsDate(startDate));
      } else {
        // truly missing -> set default
        this.firebase.setStartDate(new Date().toISOString().split('T')[0]);
      }

      if (months) {
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

      this.customPlanConfig.set(customPlanConfig ?? null);

      this.loading.set(false);

      // Update Android home screen widget
      this.updateWidget();
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

  async setEntireDayRead(chapters: string[]) {
    this.haptics.medium();

    const value = !this.isEntireDayRead(chapters);
    if (value) {
      await this.firebase.addChapters(chapters);

      this.readSet.set(new Set([...this.readSet(), ...chapters]));
    } else {
      await this.firebase.deleteChapters(chapters);

      this.readSet.set(
        new Set([...this.readSet()].filter((c) => !chapters.includes(c))),
      );
    }
  }

  isChapterRead(chapter: string) {
    return this.readSet().has(chapter)
  }

  markAllAsRead(chapters: string[]) {
    this.haptics.success();
    this.firebase.addChapters(chapters);
    this.readSet.set(new Set([...this.readSet(), ...chapters]));
  }

  markAllAsUnread(chapters: string[]) {
    this.haptics.medium();
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

  toggleChapterRead(chapter: string) {
    const isRead = this.isChapterRead(chapter);
    this.haptics.light();
    if (isRead) {
      this.firebase.deleteChapters([chapter]);
      this.readSet.set(new Set([...this.readSet()].filter((c) => c !== chapter)));
    } else {
      this.firebase.addChapters([chapter]);
      this.readSet.set(new Set([...this.readSet(), chapter]));
    }
  }

  readPercentage() {
    const readChapters = this.readSet();
    //Use ChaptersWithVerses to get the total number of verses of the read chapters
    const totalVerses = ChapterWithVerses.flatMap((book) => book.chapters).filter((chapter) => readChapters.has(chapter.chapter)).reduce((sum, chapter) => sum + chapter.verses, 0);
    return Number.parseFloat((totalVerses / TOTAL_BIBLE_VERSES * 100).toFixed(2));
  }

  private updateWidget() {
    const pct = this.readPercentage();
    const status = this.hasReadWholeBible()
      ? 'Ai citit întreaga Biblie!'
      : `${pct}% completat`;

    // Calculate days ahead/behind
    const startMs = this.activeStartDate()?.getTime() ?? Date.now();
    const diffMs = Date.now() - startMs;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const expectedDays = (diffDays * 12) / (this.months() ?? 12);

    const plan = this.getActivePlan();
    let daysRead = 0;
    for (const week of plan) {
      for (const day of week.days) {
        if (day.chapters.every((ch: string) => this.readSet().has(ch))) {
          daysRead++;
        }
      }
    }

    const diff = Math.round(daysRead - expectedDays);
    let step: string;
    let stepType: string;
    if (diff > 0) {
      step = `\u25B2 ${diff} zile înainte`;
      stepType = 'ahead';
    } else if (diff < 0) {
      step = `\u25BC ${Math.abs(diff)} zile în urmă`;
      stepType = 'behind';
    } else {
      step = '\u2713 La zi';
      stepType = 'ontrack';
    }

    this.widget.updateWidget(pct, status, step, stepType, 'Apasă pentru a continua citirea');
  }

  private getActivePlan(): IPlan[] {
    const selected = this.selectedPlan();
    if (selected === TABS.CRONOLOGIC) return CRONOLOGIC;
    if (selected === TABS.PERSONALIZAT) return this.customPlan();
    return INORDINE;
  }
}
