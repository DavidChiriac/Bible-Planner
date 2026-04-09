import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { combineLatest, distinctUntilChanged, EMPTY, from, switchMap } from 'rxjs';
import { TABS } from '../../pages/plans/plans';
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
import { BibleTextService } from './bible-text.service';

const TOTAL_BIBLE_VERSES = 31102;
const VERSE_MAP = new Map(ChapterWithVerses.flatMap(b => b.chapters.map(c => [c.chapter, c.verses] as const)));

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
  selectedTranslation = signal<string | null>(null);

  private readonly firebase = inject(FirebaseService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  private readonly haptics = inject(HapticsService);
  private readonly widget = inject(WidgetService);
  private readonly planGenerator = inject(PlanGeneratorService);
  private readonly bibleText = inject(BibleTextService);
  
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

  planChaptersOrdered = computed<string[]>(() => {
    const weeks = this.getActivePlan();
    return weeks.flatMap(w => w.days.flatMap(d => d.chapters));
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
              selectedTranslation: this.firebase.getSelectedTranslation$(),
            })
          ),
        );
      })
    )
    .subscribe(({ chapters, startDate, months, plan, favouriteWeeks, customPlanConfig, selectedTranslation }) => {
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

      this.selectedTranslation.set(selectedTranslation);
      if (selectedTranslation) {
        this.bibleText.setTranslation(selectedTranslation);
      }

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
    this.updateWidget();
  }

  isChapterRead(chapter: string) {
    return this.readSet().has(chapter)
  }

  markAllAsRead(chapters: string[]) {
    this.haptics.success();
    this.firebase.addChapters(chapters);
    this.readSet.set(new Set([...this.readSet(), ...chapters]));
    this.updateWidget();
  }

  markAllAsUnread(chapters: string[]) {
    this.haptics.medium();
    this.firebase.deleteChapters(chapters);
    this.readSet.set(new Set([...this.readSet()].filter((c) => !chapters.includes(c))));
    this.updateWidget();
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

  hasCompletedPlan() {
    return this.readPercentage() >= 100;
  }

  reset() {
    this.readSet.set(new Set());
    this.months.set(null);
    this.selectedPlan.set(undefined);
    this.selectedTranslation.set(null);
    this.loading.set(false);
  }

  isWeekBookmarked(week: { week: number }) {
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
    this.updateWidget();
  }

  readPercentage() {
    const readChapters = this.readSet();

    if (this.selectedPlan() === TABS.PERSONALIZAT) {
      const planChapters = new Set(
        this.customPlan().flatMap(week => week.days.flatMap(day => day.chapters))
      );
      if (planChapters.size === 0) return 0;
      let readVerses = 0;
      let totalVerses = 0;
      for (const ch of planChapters) {
        const v = VERSE_MAP.get(ch) ?? 0;
        totalVerses += v;
        if (readChapters.has(ch)) readVerses += v;
      }
      if (totalVerses === 0) return 0;
      return Number.parseFloat((readVerses / totalVerses * 100).toFixed(2));
    }

    const totalVerses = ChapterWithVerses.flatMap((book) => book.chapters).filter((chapter) => readChapters.has(chapter.chapter)).reduce((sum, chapter) => sum + chapter.verses, 0);
    return Number.parseFloat((totalVerses / TOTAL_BIBLE_VERSES * 100).toFixed(2));
  }

  private updateWidget() {
    const pct = this.readPercentage();
    const status = this.hasCompletedPlan()
      ? 'Ai completat planul!'
      : 'completat';

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

    const todayReading = 'Apasă pentru a continua citirea';
    this.widget.updateWidget(pct, status, step, stepType, todayReading);

    // Save to Firebase so other devices' widgets can refresh
    this.firebase.saveWidgetData({
      progress: String(Math.round(pct * 100) / 100),
      status,
      step,
      stepType,
      todayReading,
    });
  }

  private getActivePlan(): IPlan[] {
    const selected = this.selectedPlan();
    if (selected === TABS.CRONOLOGIC) return CRONOLOGIC;
    if (selected === TABS.PERSONALIZAT) return this.customPlan();
    return INORDINE;
  }
}
