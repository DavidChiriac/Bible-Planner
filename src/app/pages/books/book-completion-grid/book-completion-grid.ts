import { Component, computed, inject } from '@angular/core';
import { Utils } from '../../../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import BOOKS from '../../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { Router } from '@angular/router';
import { getVerseCount } from '../../../shared/services/plan-generator.service';
import { BOOK_ABBREVIATIONS } from '../../../shared/constants/book-abbreviations';
import { slugify } from '../../../shared/utils/slugify';
import { I18nService } from '../../../shared/services/i18n.service';

interface BookProgress {
  title: string;
  total: number;
  read: number;
  percentage: number;
}

@Component({
  selector: 'app-book-completion-grid',
  imports: [NgClass, TooltipModule],
  templateUrl: './book-completion-grid.html',
  styleUrl: './book-completion-grid.scss',
})
export class BookCompletionGrid {
  utils = inject(Utils);
  i18n = inject(I18nService);
  private readonly router = inject(Router);

  oldTestament = computed<BookProgress[]>(() => this.booksProgress().slice(0, 39));
  newTestament = computed<BookProgress[]>(() => this.booksProgress().slice(39));

  booksProgress = computed<BookProgress[]>(() => {
    const readSet = this.utils.readSet();
    return BOOKS.map(book => {
      const read = book.chapters.filter(ch => readSet.has(ch)).length;
      const total = book.chapters.length;
      return {
        title: book.title,
        total,
        read,
        percentage: total > 0 ? Math.round((read / total) * 100) : 0,
      };
    });
  });

  otProgress = computed(() => this.testamentProgress(BOOKS.slice(0, 39)));
  ntProgress = computed(() => this.testamentProgress(BOOKS.slice(39)));

  private testamentProgress(books: typeof BOOKS): number {
    const readSet = this.utils.readSet();
    let totalVerses = 0;
    let readVerses = 0;
    for (const book of books) {
      for (const ch of book.chapters) {
        const v = getVerseCount(ch);
        totalVerses += v;
        if (readSet.has(ch)) readVerses += v;
      }
    }
    return totalVerses > 0 ? Number(((readVerses / totalVerses) * 100).toFixed(2)) : 0;
  }

  completedBooks = computed(() => this.booksProgress().filter(b => b.percentage === 100).length);
  inProgressBooks = computed(() => this.booksProgress().filter(b => b.percentage > 0 && b.percentage < 100).length);

  getProgressClass(book: BookProgress): string {
    if (book.percentage === 100) return 'complete';
    if (book.percentage >= 75) return 'high';
    if (book.percentage >= 50) return 'medium';
    if (book.percentage > 0) return 'low';
    return 'unread';
  }

  abbreviate(title: string): string {
    return BOOK_ABBREVIATIONS[title] ?? title.substring(0, 4);
  }

  navigateToBook(title: string) {
    this.router.navigate([`/books/${slugify(title)}`]);
  }
}
