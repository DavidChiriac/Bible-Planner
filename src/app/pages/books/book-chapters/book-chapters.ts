import { Component, computed, inject, signal } from '@angular/core';
import BOOKS from '../../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { CheckboxModule } from 'primeng/checkbox';
import { Utils } from '../../../shared/services/utils.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Button } from "primeng/button";
import { ActivatedRoute, Router } from '@angular/router';
import { slugify } from '../../../shared/utils/slugify';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ProgressBar } from 'primeng/progressbar';
import { Tooltip } from 'primeng/tooltip';
import { I18nService } from '../../../shared/services/i18n.service';

@Component({
  selector: 'app-book-chapters',
  imports: [CheckboxModule, FormsModule, NgClass, Button, ProgressBar, Tooltip],
  templateUrl: './book-chapters.html',
  styleUrl: './book-chapters.scss',
})
export class BookChapters {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  firebase = inject(FirebaseService);
  utils = inject(Utils);
  i18n = inject(I18nService);

  id = signal('');

  bookIndex = computed(() =>
    BOOKS.findIndex(b => slugify(b.title) === this.id())
  );

  book = computed(() => {
    const idx = this.bookIndex();
    return idx >= 0 ? BOOKS[idx] : undefined;
  });

  prevBook = computed(() => {
    const idx = this.bookIndex();
    return idx > 0 ? BOOKS[idx - 1] : undefined;
  });

  nextBook = computed(() => {
    const idx = this.bookIndex();
    return idx >= 0 && idx < BOOKS.length - 1 ? BOOKS[idx + 1] : undefined;
  });

  readCount = computed(() => {
    const chapters = this.book()?.chapters ?? [];
    return chapters.filter(ch => this.utils.readSet().has(ch)).length;
  });

  totalCount = computed(() => this.book()?.chapters?.length ?? 0);

  planBookChapters = computed(() => {
    const planSet = new Set(this.utils.planChaptersOrdered());
    return (this.book()?.chapters ?? []).filter(ch => planSet.has(ch));
  });

  isChapterInPlan = (chapter: string) =>
    this.planBookChapters().includes(chapter);

  progress = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.readCount() / total) * 100);
  });

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.id.set(id);
      }
    });
  }

  goBack() {
    globalThis.history.back();
  }

  navigateToBook(title: string) {
    this.router.navigate([`/books/${slugify(title)}`], { replaceUrl: true });
  }

  readChapter(chapter: string) {
    this.router.navigate(['/reader'], { queryParams: { chapter } });
  }
}
