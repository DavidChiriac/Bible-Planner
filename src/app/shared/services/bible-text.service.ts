import { Injectable } from '@angular/core';
import BOOKS from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import BIBLE from '../../../assets/jsons/cornilescu.json';

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  bookName: string;
  chapterNumber: number;
  verses: BibleVerse[];
}

/** Map Romanian book titles → book number (1-66) */
const BOOK_NUMBER_MAP: Record<string, number> = {};
BOOKS.forEach((book, index) => {
  BOOK_NUMBER_MAP[book.title] = index + 1;
});

/** Pre-index verses by "bookNr:chapter" for O(1) lookup */
const VERSE_INDEX = new Map<string, { verse: number; text: string }[]>();
for (const v of (BIBLE as any).verses) {
  const key = `${v.book}:${v.chapter}`;
  let arr = VERSE_INDEX.get(key);
  if (!arr) {
    arr = [];
    VERSE_INDEX.set(key, arr);
  }
  arr.push({ verse: v.verse, text: v.text });
}

@Injectable({ providedIn: 'root' })
export class BibleTextService {

  /**
   * Get chapter text for a label like "Geneza 1".
   * Uses local cornilescu.json data.
   */
  getChapter(chapterLabel: string): BibleChapter | null {
    const { bookName, chapterNumber } = this.parseChapterLabel(chapterLabel);
    if (!bookName || !chapterNumber) return null;

    const bookNr = BOOK_NUMBER_MAP[bookName];
    if (!bookNr) return null;

    const raw = VERSE_INDEX.get(`${bookNr}:${chapterNumber}`);
    if (!raw || raw.length === 0) return null;

    const verses: BibleVerse[] = raw.map(v => ({
      verse: v.verse,
      text: v.text.trim(),
    }));

    return { bookName, chapterNumber, verses };
  }

  /**
   * Parse "Geneza 1" → { bookName: "Geneza", chapterNumber: 1 }
   * Handles multi-word names like "1 Samuel 3" or "Cântarea Cântărilor 2".
   */
  private parseChapterLabel(label: string): { bookName: string; chapterNumber: number } {
    const parts = label.trim().split(' ');
    const chapterNumber = Number(parts.pop());
    const bookName = parts.join(' ');
    return { bookName, chapterNumber };
  }

  /**
   * Get next/previous chapter label relative to the current one.
   * Returns null if at the boundary.
   */
  getAdjacentChapter(currentLabel: string, direction: 'next' | 'prev'): string | null {
    const { bookName, chapterNumber } = this.parseChapterLabel(currentLabel);
    const bookNr = BOOK_NUMBER_MAP[bookName];
    if (!bookNr) return null;

    const bookIndex = bookNr - 1;
    const book = BOOKS[bookIndex];

    if (direction === 'next') {
      if (chapterNumber < book.chapters.length) {
        return `${bookName} ${chapterNumber + 1}`;
      }
      // Move to next book
      if (bookIndex + 1 < BOOKS.length) {
        return BOOKS[bookIndex + 1].chapters[0];
      }
      return null;
    } else {
      if (chapterNumber > 1) {
        return `${bookName} ${chapterNumber - 1}`;
      }
      // Move to previous book's last chapter
      if (bookIndex > 0) {
        const prevBook = BOOKS[bookIndex - 1];
        return prevBook.chapters[prevBook.chapters.length - 1];
      }
      return null;
    }
  }
}
