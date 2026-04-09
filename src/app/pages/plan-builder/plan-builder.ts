import { Component, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { BIBLE_BOOKS, FirebaseService } from '../../shared/services/firebase.service';
import { getVerseCount, OT_END_INDEX, PlanGeneratorService, EXCLUSION_CATEGORIES, ExclusionCategory } from '../../shared/services/plan-generator.service';
import { Utils } from '../../shared/services/utils.service';
import { TABS } from '../plans/plans';
import { I18nService } from '../../shared/services/i18n.service';

interface BookOption {
  title: string;
  chapters: number;
  verses: number;
  selected: boolean;
}

@Component({
  selector: 'app-plan-builder',
  imports: [NgClass, FormsModule, AccordionModule, ButtonModule, CheckboxModule, DatePickerModule, InputTextModule, ToggleSwitchModule],
  templateUrl: './plan-builder.html',
  styleUrl: './plan-builder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PlanBuilder {
  utils = inject(Utils);
  i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly firebase = inject(FirebaseService);
  private readonly planGenerator = inject(PlanGeneratorService);

  otBooks: ReturnType<typeof signal<BookOption[]>>;
  ntBooks: ReturnType<typeof signal<BookOption[]>>;
  days: ReturnType<typeof signal<number>>;
  places: ReturnType<typeof signal<number>>;
  planStartDate: ReturnType<typeof signal<Date | null>>;
  planTargetDate: ReturnType<typeof signal<Date | null>>;

  excludeGenealogies: ReturnType<typeof signal<boolean>>;
  excludeLaw: ReturnType<typeof signal<boolean>>;
  excludeLand: ReturnType<typeof signal<boolean>>;
  excludeTabernacle: ReturnType<typeof signal<boolean>>;
  excludeProphecies: ReturnType<typeof signal<boolean>>;

  constructor() {
    const existing = this.utils.customPlanConfig();
    const selectedSet = new Set(existing?.books ?? []);
    const excludeSet = new Set(existing?.excludeCategories ?? []);

    this.otBooks = signal(
      BIBLE_BOOKS.slice(0, OT_END_INDEX).map(b => ({
        title: b.title,
        chapters: b.chapters.length,
        verses: b.chapters.reduce((sum, ch) => sum + getVerseCount(ch), 0),
        selected: selectedSet.has(b.title),
      }))
    );

    this.ntBooks = signal(
      BIBLE_BOOKS.slice(OT_END_INDEX).map(b => ({
        title: b.title,
        chapters: b.chapters.length,
        verses: b.chapters.reduce((sum, ch) => sum + getVerseCount(ch), 0),
        selected: selectedSet.has(b.title),
      }))
    );

    this.days = signal(existing?.days ?? 0);
    this.places = signal(existing?.places ?? 1);
    this.planStartDate = signal(
      existing?.startDate ? this.utils.startDateAsDate(existing.startDate) : new Date()
    );
    this.planTargetDate = signal(
      existing?.targetDate ? this.utils.startDateAsDate(existing.targetDate) : null
    );

    this.excludeGenealogies = signal(excludeSet.has('genealogies'));
    this.excludeLaw = signal(excludeSet.has('law'));
    this.excludeLand = signal(excludeSet.has('land'));
    this.excludeTabernacle = signal(excludeSet.has('tabernacle'));
    this.excludeProphecies = signal(excludeSet.has('prophecies'));
  }

  onStartDateChange(date: Date | null) {
    this.planStartDate.set(date);
    this.recalcDaysFromTarget();
  }

  onTargetDateChange(date: Date | null) {
    this.planTargetDate.set(date);
    this.recalcDaysFromTarget();
  }

  onDaysChange(days: number) {
    this.days.set(days);
    const start = this.planStartDate();
    if (start && days > 0) {
      const target = new Date(start);
      target.setDate(target.getDate() + days);
      this.planTargetDate.set(target);
    }
  }

  private recalcDaysFromTarget() {
    const start = this.planStartDate();
    const target = this.planTargetDate();
    if (start && target && target > start) {
      const diffDays = Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        this.days.set(diffDays);
      }
    }
  }

  allOtSelected = computed(() => this.otBooks().every(b => b.selected));
  someOtSelected = computed(() => this.otBooks().some(b => b.selected) && !this.allOtSelected());
  allNtSelected = computed(() => this.ntBooks().every(b => b.selected));
  someNtSelected = computed(() => this.ntBooks().some(b => b.selected) && !this.allNtSelected());

  activeExclusions = computed<string[]>(() => {
    const cats: string[] = [];
    if (this.excludeGenealogies()) cats.push('genealogies');
    if (this.excludeLaw()) cats.push('law');
    if (this.excludeLand()) cats.push('land');
    if (this.excludeTabernacle()) cats.push('tabernacle');
    if (this.excludeProphecies()) cats.push('prophecies');
    return cats;
  });

  excludedChapterSet = computed(() => {
    const excluded = new Set<string>();
    for (const cat of this.activeExclusions()) {
      const chapters = EXCLUSION_CATEGORIES[cat as ExclusionCategory];
      if (chapters) {
        for (const ch of chapters) excluded.add(ch);
      }
    }
    return excluded;
  });

  selectedBooks = computed(() => [
    ...this.otBooks().filter(b => b.selected),
    ...this.ntBooks().filter(b => b.selected),
  ]);

  totalChapters = computed(() => {
    const excluded = this.excludedChapterSet();
    return this.selectedBooks().reduce((sum, b) => {
      const book = BIBLE_BOOKS.find(bb => bb.title === b.title);
      if (!book) return sum + b.chapters;
      return sum + book.chapters.filter(ch => !excluded.has(ch)).length;
    }, 0);
  });

  totalVerses = computed(() => {
    const excluded = this.excludedChapterSet();
    return this.selectedBooks().reduce((sum, b) => {
      const book = BIBLE_BOOKS.find(bb => bb.title === b.title);
      if (!book) return sum + b.verses;
      return sum + book.chapters.filter(ch => !excluded.has(ch)).reduce((s, ch) => s + getVerseCount(ch), 0);
    }, 0);
  });

  totalPlanDays = computed(() => this.days() * this.places());

  versesPerDay = computed(() => {
    const total = this.totalVerses();
    const d = this.totalPlanDays();
    return d > 0 ? Math.ceil(total / d) : 0;
  });

  chaptersPerDay = computed(() => {
    const total = this.totalChapters();
    const d = this.totalPlanDays();
    return d > 0 ? Math.ceil(total / d) : 0;
  });

  canGenerate = computed(() =>
    this.selectedBooks().length > 0 && (this.days() > 0 || this.planTargetDate() !== null) && this.places() > 0
  );

  showPreview = signal(false);

  preview = computed(() => {
    if (!this.canGenerate()) return [];
    const config = {
      books: this.selectedBooks().map(b => b.title),
      days: this.days(),
      places: this.places(),
      excludeCategories: this.activeExclusions(),
    };
    return this.planGenerator.generate(config);
  });

  toggleOtAll() {
    const newVal = !this.allOtSelected();
    this.otBooks.update(books =>
      books.map(b => ({ ...b, selected: newVal }))
    );
  }

  toggleNtAll() {
    const newVal = !this.allNtSelected();
    this.ntBooks.update(books =>
      books.map(b => ({ ...b, selected: newVal }))
    );
  }

  toggleBook(list: 'ot' | 'nt', index: number) {
    const sig = list === 'ot' ? this.otBooks : this.ntBooks;
    sig.update(books =>
      books.map((b, i) => i === index ? { ...b, selected: !b.selected } : b)
    );
  }

  togglePreview() {
    this.showPreview.update(v => !v);
  }

  async generate() {
    const d = this.planStartDate();
    const iso = d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];

    const t = this.planTargetDate();
    const targetIso = t
      ? `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
      : undefined;

    const exclusions = this.activeExclusions();

    const config = {
      books: this.selectedBooks().map(b => b.title),
      days: this.days(),
      places: this.places(),
      startDate: iso,
      ...(targetIso ? { targetDate: targetIso } : {}),
      ...(exclusions.length > 0 ? { excludeCategories: exclusions } : {}),
    };
    await this.firebase.setCustomPlanConfig(config);
    this.utils.customPlanConfig.set(config);
    this.utils.selectedPlan.set(TABS.PERSONALIZAT);
    await this.firebase.setSelectedPlan(TABS.PERSONALIZAT);
    this.router.navigate(['/plans']);
  }

  goBack() {
    globalThis.history.back();
  }

  dayVerses(chapters: string[]): number {
    return chapters.reduce((sum, ch) => sum + getVerseCount(ch), 0);
  }
}
