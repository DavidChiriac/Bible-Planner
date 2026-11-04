import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { combineLatest, distinctUntilChanged, EMPTY, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { authState } from '@angular/fire/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import ChapterWithVerses from '../../../assets/jsons/biblia_ro_capitole_cu_versete_complete.json';
import { HapticsService } from './haptics.service';
import { WidgetService } from './widget.service';
import { CustomPlanConfig, PlanGeneratorService } from './plan-generator.service';
import { IPlan } from '../models/plan.model';
import { BibleTextService } from './bible-text.service';

const VERSE_MAP = new Map(ChapterWithVerses.flatMap(b => b.chapters.map(c => [c.chapter, c.verses] as const)));

@Injectable({
  providedIn: 'root',
})
export class Utils {
  readSet = signal(new Set<string>());
  loading = signal(true);
  startDate = signal<Date | null>(null);
  months = signal<number | null>(null);
  favouriteWeeks = signal<number[]>([]);
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
    const sd = this.customPlanConfig()?.startDate;
    return sd ? this.startDateAsDate(sd) : this.startDate();
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

        return combineLatest({
          chapters: this.firebase.getChapters(),
          startDate: this.firebase.getStartDate(),
          months: this.firebase.getMonths(),
          favouriteWeeks: this.firebase.getFavouriteWeeks$(),
          customPlanConfig: this.firebase.getCustomPlanConfig$(),
          selectedTranslation: this.firebase.getSelectedTranslation$(),
        });
      })
    )
    .subscribe(({ chapters, startDate, months, favouriteWeeks, customPlanConfig, selectedTranslation }) => {
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

      this.favouriteWeeks.set(favouriteWeeks ?? []);

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
    this.requireActivePlan();
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
    this.requireActivePlan();
    this.haptics.success();
    this.firebase.addChapters(chapters);
    this.readSet.set(new Set([...this.readSet(), ...chapters]));
    this.updateWidget();
  }

  async recordReadChapters(chapters: string[]) {
    const newChapters = chapters.filter(chapter => !this.isChapterRead(chapter));
    if (newChapters.length === 0) return;

    await this.firebase.addChapters(newChapters);
    this.haptics.success();
    this.readSet.update(read => new Set([...read, ...newChapters]));
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
    this.customPlanConfig.set(null);
    this.months.set(null);
    this.selectedTranslation.set(null);
    this.loading.set(false);
  }

  isWeekBookmarked(week: { week: number }) {
    return this.favouriteWeeks().includes(week.week);
  }

  toggleChapterRead(chapter: string) {
    this.requireActivePlan();
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

  private requireActivePlan() {
    if (!this.customPlanConfig()) {
      throw new Error('Configure a reading plan before marking chapters as read.');
    }
  }

  readPercentage() {
    const readChapters = this.readSet();
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

  private updateWidget() {
    if (!this.customPlanConfig()) {
      this.widget.updateWidget(0, '', '', 'ontrack', 'Configurează un plan');
      this.firebase.saveWidgetData({
        progress: '0',
        status: '',
        step: '',
        stepType: 'ontrack',
        todayReading: 'Configurează un plan',
      });
      return;
    }

    const pct = this.readPercentage();
    const status = this.hasCompletedPlan()
      ? 'Felicitări! Ai completat planul!'
      : 'completat';

    // Calculate days ahead/behind
    const startDate = this.activeStartDate() ?? new Date();
    const startNorm = new Date(startDate);
    startNorm.setHours(0, 0, 0, 0);
    const todayNorm = new Date();
    todayNorm.setHours(0, 0, 0, 0);
    const diffMs = todayNorm.getTime() - startNorm.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

    const plan = this.getActivePlan();
    const totalReadingDays = plan.reduce((sum, w) => sum + w.days.length, 0);
    
    let targetDate: Date;
    const customTargetDate = this.customPlanConfig()?.targetDate;
    if (customTargetDate) {
      targetDate = new Date(customTargetDate);
    } else {
      const months = this.months() ?? 12;
      targetDate = new Date(startNorm);
      targetDate.setMonth(targetDate.getMonth() + months);
    }
    
    const totalCalendarDays = Math.ceil((targetDate.getTime() - startNorm.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDays = totalCalendarDays > 0
      ? (diffDays * totalReadingDays) / totalCalendarDays
      : diffDays;

    let daysRead = 0;
    for (const week of plan) {
      for (const day of week.days) {
        if (day.chapters.every((ch: string) => this.readSet().has(ch))) {
          daysRead++;
        }
      }
    }

    const rawDiff = Math.round(daysRead - expectedDays);
    const diff = Math.max(-totalReadingDays, Math.min(totalReadingDays, rawDiff));
    const { step, stepType } = this.resolveStep(diff);

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

  private resolveStep(diff: number): { step: string; stepType: string } {
    if (this.hasCompletedPlan()) return { step: '', stepType: 'ontrack' };

    const places = this.customPlanConfig()?.places ?? 1;
    const absDiff = Math.abs(diff);
    const fullDays = Math.floor(absDiff / places);
    const remainder = absDiff % places;
    const dayLabel = remainder > 0 ? `${fullDays} + (${remainder}/${places})` : `${fullDays}`;
    const dayUnit = fullDays === 1 && remainder === 0 ? 'zi' : 'zile';

    if (diff > 0) return { step: `\u25B2 ${dayLabel} ${dayUnit} înainte`, stepType: 'ahead' };
    if (diff < 0) return { step: `\u25BC ${dayLabel} ${dayUnit} în urmă`, stepType: 'behind' };
    return { step: '\u2713 La zi', stepType: 'ontrack' };
  }

  private getActivePlan(): IPlan[] {
    return this.customPlan();
  }
}
