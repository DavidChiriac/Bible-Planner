import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { BIBLE_BOOKS } from '../../services/firebase.service';
import { I18nService } from '../../services/i18n.service';
import { Utils } from '../../services/utils.service';
import { BOOK_NAMES_EN_SORTED } from '../../i18n/translations';

interface ChapterEntry {
  id: number;
  input: string;
  chapters: string[];
}

@Component({
  selector: 'app-read-chapter-entry',
  imports: [FormsModule, DialogModule],
  templateUrl: './read-chapter-entry.html',
  styleUrl: './read-chapter-entry.scss',
})
export class ReadChapterEntry {
  readonly i18n = inject(I18nService);
  private readonly utils = inject(Utils);

  readonly chapterInput = signal('');
  readonly entries = signal<ChapterEntry[]>([]);
  readonly selectedChapters = computed(() => [
    ...new Set(this.entries().flatMap(entry => entry.chapters)),
  ]);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly ignoredChapters = signal<string[]>([]);
  readonly ignoredChaptersChange = output<string[]>();

  dismissIgnoredChapters() {
    this.ignoredChapters.set([]);
    this.ignoredChaptersChange.emit([]);
  }

  private filterPlanChapters(chapters: string[]): string[] {
    const planChapters = new Set(this.utils.planChaptersOrdered());
    return chapters.filter(chapter => planChapters.has(chapter));
  }

  private matchBookPrefix(value: string) {
    return BIBLE_BOOKS.flatMap(book => {
      const englishTitle = BOOK_NAMES_EN_SORTED.find(([title]) => title === book.title)?.[1];
      return [book.title, englishTitle]
        .filter((title): title is string => Boolean(title))
        .map(title => ({ book, title }));
    })
      .sort((a, b) => b.title.length - a.title.length)
      .find(({ title }) => value.toLocaleLowerCase().startsWith(`${title.toLocaleLowerCase()} `));
  }

  private expandBookRange(startBookTitle: string, startChapter: number, endBookTitle: string, endChapter: number) {
    const startBookIndex = BIBLE_BOOKS.findIndex(book => book.title === startBookTitle);
    const endBookIndex = BIBLE_BOOKS.findIndex(book => book.title === endBookTitle);
    if (startBookIndex < 0 || endBookIndex < startBookIndex) return null;
    const startBook = BIBLE_BOOKS[startBookIndex];
    const endBook = BIBLE_BOOKS[endBookIndex];
    if (
      startChapter < 1 ||
      startChapter > startBook.chapters.length ||
      endChapter < 1 ||
      endChapter > endBook.chapters.length
    ) return null;

    const chapters: string[] = [];
    for (let bookIndex = startBookIndex; bookIndex <= endBookIndex; bookIndex++) {
      const book = BIBLE_BOOKS[bookIndex];
      const firstChapter = bookIndex === startBookIndex ? startChapter : 1;
      const lastChapter = bookIndex === endBookIndex ? endChapter : book.chapters.length;
      if (firstChapter > lastChapter) return null;
      for (let chapter = firstChapter; chapter <= lastChapter; chapter++) {
        chapters.push(`${book.title} ${chapter}`);
      }
    }
    return chapters;
  }

  addEntry() {
    const value = this.chapterInput().trim();
    if (!value) {
      this.error.set('readChapterEntry.invalidRange');
      return;
    }

    const chapters: string[] = [];
    for (const part of value.split(/[;\n]/)) {
      const trimmedPart = part.trim();
      const matchedBook = this.matchBookPrefix(trimmedPart);
      if (!matchedBook) {
        this.error.set('readChapterEntry.invalidRange');
        return;
      }

      const chapterRanges = trimmedPart.slice(matchedBook.title.length).trim();
      const crossBookRange = /^(\d+)\s*-\s*(.+)$/.exec(chapterRanges);
      if (crossBookRange) {
        const endBookPrefix = this.matchBookPrefix(crossBookRange[2]);
        if (endBookPrefix) {
          const endChapterMatch = /^(\d+)$/.exec(crossBookRange[2].slice(endBookPrefix.title.length).trim());
          const expanded = endChapterMatch
            ? this.expandBookRange(matchedBook.book.title, Number(crossBookRange[1]), endBookPrefix.book.title, Number(endChapterMatch[1]))
            : null;
          if (!expanded) {
            this.error.set('readChapterEntry.invalidRange');
            return;
          }
          chapters.push(...expanded);
          continue;
        }
      }

      for (const chapterRange of chapterRanges.split(',')) {
        const match = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(chapterRange);
        if (!match) {
          this.error.set('readChapterEntry.invalidRange');
          return;
        }

        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : start;
        if (start < 1 || end < start || end > matchedBook.book.chapters.length) {
          this.error.set('readChapterEntry.invalidRange');
          return;
        }
        for (let chapter = start; chapter <= end; chapter++) {
          chapters.push(`${matchedBook.book.title} ${chapter}`);
        }
      }
    }

    this.ignoredChapters.set([]);
    this.ignoredChaptersChange.emit([]);
    this.error.set('');

    this.entries.update(entries => [
      ...entries,
      {
        id: Date.now() + Math.random(),
        input: value,
        chapters: [...new Set(chapters)],
      },
    ]);
    this.chapterInput.set('');
  }

  removeEntry(id: number) {
    this.entries.update(entries => entries.filter(entry => entry.id !== id));
  }

  async saveAsRead() {
    const selectedChapters = this.selectedChapters();
    const includedChapters = this.filterPlanChapters(selectedChapters);
    const includedSet = new Set(includedChapters);
    this.ignoredChapters.set(selectedChapters.filter(chapter => !includedSet.has(chapter)));
    this.ignoredChaptersChange.emit(this.ignoredChapters());
    this.error.set('');
    if (includedChapters.length === 0) {
      this.entries.set([]);
      return;
    }
    const unreadChapters = includedChapters.filter(chapter => !this.utils.isChapterRead(chapter));
    if (unreadChapters.length === 0) {
      this.error.set('readChapterEntry.alreadyRead');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    try {
      await this.utils.recordReadChapters(unreadChapters);
      this.entries.set([]);
    } catch {
      this.error.set('readChapterEntry.saveError');
    } finally {
      this.saving.set(false);
    }
  }
}
