import { Component, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { BIBLE_BOOKS, FirebaseService } from '../../shared/services/firebase.service';
import { getVerseCount, OT_END_INDEX, PlanGeneratorService } from '../../shared/services/plan-generator.service';
import { Utils } from '../../shared/services/utils.service';
import { TABS } from '../home-page/home-page';

interface BookOption {
  title: string;
  chapters: number;
  verses: number;
  selected: boolean;
}

@Component({
  selector: 'app-plan-builder',
  imports: [NgClass, FormsModule, AccordionModule, ButtonModule, CheckboxModule, DatePickerModule, InputTextModule],
  templateUrl: './plan-builder.html',
  styleUrl: './plan-builder.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PlanBuilder {
  utils = inject(Utils);
  private readonly router = inject(Router);
  private readonly firebase = inject(FirebaseService);
  private readonly planGenerator = inject(PlanGeneratorService);

  otBooks: ReturnType<typeof signal<BookOption[]>>;
  ntBooks: ReturnType<typeof signal<BookOption[]>>;
  days: ReturnType<typeof signal<number>>;
  planStartDate: ReturnType<typeof signal<Date | null>>;

  constructor() {
    const existing = this.utils.customPlanConfig();
    const selectedSet = new Set(existing?.books ?? []);

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

    this.days = signal(existing?.days ?? 30);
    this.planStartDate = signal(
      existing?.startDate ? this.utils.startDateAsDate(existing.startDate) : new Date()
    );
  }

  allOtSelected = computed(() => this.otBooks().every(b => b.selected));
  someOtSelected = computed(() => this.otBooks().some(b => b.selected) && !this.allOtSelected());
  allNtSelected = computed(() => this.ntBooks().every(b => b.selected));
  someNtSelected = computed(() => this.ntBooks().some(b => b.selected) && !this.allNtSelected());

  selectedBooks = computed(() => [
    ...this.otBooks().filter(b => b.selected),
    ...this.ntBooks().filter(b => b.selected),
  ]);

  totalChapters = computed(() =>
    this.selectedBooks().reduce((sum, b) => sum + b.chapters, 0)
  );

  totalVerses = computed(() =>
    this.selectedBooks().reduce((sum, b) => sum + b.verses, 0)
  );

  versesPerDay = computed(() => {
    const total = this.totalVerses();
    const d = this.days();
    return d > 0 ? Math.ceil(total / d) : 0;
  });

  chaptersPerDay = computed(() => {
    const total = this.totalChapters();
    const d = this.days();
    return d > 0 ? Math.ceil(total / d) : 0;
  });

  canGenerate = computed(() =>
    this.selectedBooks().length > 0 && this.days() > 0
  );

  showPreview = signal(false);

  preview = computed(() => {
    if (!this.canGenerate()) return [];
    const config = {
      books: this.selectedBooks().map(b => b.title),
      days: this.days(),
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

    const config = {
      books: this.selectedBooks().map(b => b.title),
      days: this.days(),
      startDate: iso,
    };
    await this.firebase.setCustomPlanConfig(config);
    this.utils.customPlanConfig.set(config);
    this.utils.selectedPlan.set(TABS.PERSONALIZAT);
    await this.firebase.setSelectedPlan(TABS.PERSONALIZAT);
    this.router.navigate(['/']);
  }

  goBack() {
    globalThis.history.back();
  }

  dayVerses(chapters: string[]): number {
    return chapters.reduce((sum, ch) => sum + getVerseCount(ch), 0);
  }
}
