import { Component, computed, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { Utils } from '../../shared/services/utils.service';
import { BIBLE_BOOKS, FirebaseService, PlanHistoryEntry } from '../../shared/services/firebase.service';
import { OT_END_INDEX } from '../../shared/services/plan-generator.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { Router, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { I18nService } from '../../shared/services/i18n.service';
import { DialogModule } from 'primeng/dialog';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReadChapterEntry } from '../../shared/components/read-chapter-entry/read-chapter-entry';

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
    RouterLink,
    TooltipModule,
    DialogModule,
    ReadChapterEntry,
  ],
  templateUrl: './plans.html',
  styleUrl: './plans.scss',
})
export class Plans {
  utils = inject(Utils);
  i18n = inject(I18nService);
  private readonly firebase = inject(FirebaseService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private localDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  constructor() {
    effect(() => {
      if (!this.utils.loading() && !this.utils.customPlanConfig()) {
        untracked(() => this.router.navigate(['/plan-builder'], { replaceUrl: true }));
      }
    });

    // Expand favourite weeks on init (once only)
    effect(() => {
      if (this.utils.loading()) return;
      if (this.openWeeksInitialized) return;
      const bookmarked = this.bookmarkedWeeksForPlan();
      untracked(() => {
        this.openWeeks.set(bookmarked);
        this.openWeeksInitialized = true;
      });
    }, { allowSignalWrites: true });

    // Keep history in sync for duplicate-save detection
    this.firebase.getPlanHistory$().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(entries => {
      this.history.set(entries);
    });
  }

  targetDate = computed(() => {
    const td = this.utils.customPlanConfig()?.targetDate;
    return td ? new Date(td) : null;
  });

  pastDue = computed(() => {
    const target = this.targetDate();
    if (!target) return false;
    return new Date() > target && !this.utils.hasCompletedPlan();
  });

  restartConfirmVisible = signal(false);
  completeConfirmVisible = signal(false);
  savingCompletion = signal(false);
  readonly ignoredChapters = signal<string[]>([]);

  isAlreadySaved = computed(() => {
    const startDate = this.utils.activeStartDate();
    if (!startDate) return false;
    const key = this.localDateStr(startDate);
    return this.history().some(e => e.startDate === key);
  });

  // Plan history
  historyVisible = signal(false);
  historyLoading = signal(false);
  history = signal<PlanHistoryEntry[]>([]);
  expandedHistoryId = signal<string | null>(null);

  showHistory() {
    this.historyLoading.set(true);
    this.historyVisible.set(true);
    this.expandedHistoryId.set(null);
    this.firebase.getPlanHistory$().pipe(take(1)).subscribe(entries => {
      this.history.set(entries);
      this.historyLoading.set(false);
    });
  }

  toggleHistoryBooks(id: string) {
    this.expandedHistoryId.update(current => current === id ? null : id);
  }

  historyBookSummary(books: string[]) {
    const selected = new Set(books);
    const testaments = [
      { label: 'planBuilder.oldTestament', books: BIBLE_BOOKS.slice(0, OT_END_INDEX) },
      { label: 'planBuilder.newTestament', books: BIBLE_BOOKS.slice(OT_END_INDEX) },
    ];
    const missing = BIBLE_BOOKS.filter(book => !selected.has(book.title));
    const hasCompleteTestament = testaments.some(testament =>
      testament.books.every(book => selected.has(book.title))
    );
    if (missing.length === 0 || (!hasCompleteTestament && missing.length < 10)) {
      return [{
        label: 'home.entireBible',
        complete: missing.length === 0,
        except: missing.length > 0,
        books: missing.map(book => book.title),
      }];
    }
    return testaments.map(testament => {
      const included = testament.books.filter(book => selected.has(book.title));
      const excluded = testament.books.filter(book => !selected.has(book.title));
      const except = hasCompleteTestament && excluded.length > 0 && excluded.length < 10;
      return {
        label: testament.label,
        complete: excluded.length === 0,
        except,
        books: excluded.length === 0 ? [] : (except ? excluded : included).map(book => book.title),
      };
    }).filter(testament => testament.complete || testament.books.length > 0);
  }

  daysToComplete(entry: PlanHistoryEntry): number {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  weeks = computed(() => this.utils.customPlan());

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
    today.setHours(0, 0, 0, 0);
    const start = this.utils.activeStartDate() ?? new Date();
    const startNorm = new Date(start);
    startNorm.setHours(0, 0, 0, 0);

    const diffInMs = today.getTime() - startNorm.getTime();
    const elapsedDays =
      Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    const places = this.utils.customPlanConfig()?.places ?? 1;
    const totalSlots = this.weeks().reduce((sum, w) => sum + w.days.length, 0);
    const rawDiff = Math.round(this.numbersOfDaysRead() - elapsedDays * places);
    const clampedDiff = Math.max(-totalSlots, Math.min(totalSlots, rawDiff));

    const absDiff = Math.abs(clampedDiff);
    const fullDays = Math.floor(absDiff / places);
    const remainder = absDiff % places;

    let sign: 1 | -1 | 0;
    if (clampedDiff > 0) sign = 1;
    else if (clampedDiff < 0) sign = -1;
    else sign = 0;

    return {
      sign,
      days: fullDays,
      numerator: remainder,
      denominator: places,
    };
  });

  statusLabel = computed(() => {
    const s = this.currentStatus();
    if (s.sign === 0) return '';
    let label = `${s.days}`;
    if (s.numerator > 0) {
      label += ` + (${s.numerator}/${s.denominator})`;
    }
    return label;
  });

  openWeeks = signal<number[]>([]);
  private readonly lastNavigatedWeek = signal(0);
  private openWeeksInitialized = false;

  onWeeksChange(event: unknown) {
    this.openWeeks.set(event as number[]);
  }

  bookmarkedWeeksForPlan = computed(() => {
    return [...this.utils.favouriteWeeks()].sort((a, b) => a - b);
  });

  addWeekToOpen(week: number) {
    if (!this.openWeeks().includes(week)) {
      this.openWeeks.update((weeks) => [...weeks, week]);
    }
  }

  goToDay(dayIndex: number , tab: {week: number}) {
    this.router.navigate(['/day'], { queryParams: { day: dayIndex, week: tab.week } });
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
    this.utils.favouriteWeeks.update(weeks => weeks.filter(w => w !== tab.week));
    await this.firebase.deleteFavouriteWeek(tab.week);
  }

  async addBookmark(tab: { week: number }) {
    if (!this.utils.favouriteWeeks().includes(tab.week)) {
      this.utils.favouriteWeeks.update(weeks => [...weeks, tab.week]);
    }
    await this.firebase.addFavouriteWeek(tab.week);
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
    this.router.navigate(['/reader'], { queryParams: { chapter, source: 'plan' } });
  }

  readFirstUnread(chapters: string[]) {
    const first = chapters.find(ch => !this.utils.isChapterRead(ch)) ?? chapters[0];
    this.readChapter(first);
  }

  goToChapterNotes(chapter: string) {
    this.router.navigate(['/day'], { queryParams: { chapter } });
  }


  async confirmComplete() {
    this.completeConfirmVisible.set(false);

    if (this.isAlreadySaved()) {
      return;
    }

    this.savingCompletion.set(true);

    const allChapters = this.weeks().flatMap(w => w.days.flatMap(d => d.chapters));
    const totalChapters = allChapters.length;
    const chaptersRead = allChapters.filter(ch => this.utils.isChapterRead(ch)).length;
    const startDate = this.utils.activeStartDate();

    if (totalChapters > 0) {
      const config = this.utils.customPlanConfig();
      await this.firebase.savePlanHistory({
        planName: 'Personalizat',
        startDate: startDate ? this.localDateStr(startDate) : '',
        endDate: this.localDateStr(new Date()),
        chaptersRead,
        totalChapters,
        completionPercentage: Math.round(chaptersRead / totalChapters * 100),
        books: config?.books ?? [],
        days: config?.days,
        places: config?.places,
        ...(config?.excludeCategories?.length ? { excludeCategories: config.excludeCategories } : {}),
      }).catch(() => {});
    }

    this.savingCompletion.set(false);
  }

  async confirmRestart() {
    this.restartConfirmVisible.set(false);

    this.firebase.resetProgress()
      .then(async () => {
        this.utils.readSet.set(new Set());
        this.utils.favouriteWeeks.set([]);
        this.utils.startDate.set(null);
        this.utils.months.set(null);
        this.utils.customPlanConfig.set(null);
        await this.firebase.deleteCustomPlanConfig();
        this.router.navigate(['/plan-builder']);
      })
      .catch(err => alert('Error: ' + err.message));
  }
}