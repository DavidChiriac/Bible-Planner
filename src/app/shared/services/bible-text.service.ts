import { Injectable, signal } from '@angular/core';
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

export interface BibleTranslation {
  id: string;
  name: string;
  language: string;
  isLocal?: boolean;
}

export const TRANSLATIONS: BibleTranslation[] = [
  { id: 'local-cornilescu', name: 'Cornilescu 1924', language: 'Română', isLocal: true },
  { id: 'VDCL', name: 'Cornilescu Literal 1931', language: 'Română' },
  { id: 'NTR', name: 'Noua Traducere Românească', language: 'Română' },
  { id: 'KJV', name: 'King James Version', language: 'English' },
  { id: 'NIV', name: 'NIV 1984', language: 'English' },
  { id: 'NIV2011', name: 'NIV 2011', language: 'English' },
  { id: 'ESV', name: 'English Standard Version', language: 'English' },
  { id: 'NASB', name: 'NASB 1995', language: 'English' },
  { id: 'NLT', name: 'New Living Translation', language: 'English' },
  { id: 'NET', name: 'New English Translation', language: 'English' },
  { id: 'BSB', name: 'Berean Standard Bible', language: 'English' },
  { id: 'AMP', name: 'Amplified Bible', language: 'English' },
  { id: 'MSG', name: 'The Message', language: 'English' },
];

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

/** Strip HTML tags and Strong's numbers from API verse text */
function stripHtml(html: string): string {
  return html.replace(/<S>\d+<\/S>/gi, '').replace(/<[^>]*>/g, '').replace(/\[[^\]]*\]/g, '').trim();
}

@Injectable({ providedIn: 'root' })
export class BibleTextService {
  private apiCache = new Map<string, BibleChapter>();

  selectedTranslation = signal<string>(this.loadSavedTranslation());

  private loadSavedTranslation(): string {
    try {
      return globalThis.localStorage?.getItem('bible-translation') ?? 'local-cornilescu';
    } catch {
      return 'local-cornilescu';
    }
  }

  setTranslation(id: string) {
    this.selectedTranslation.set(id);
    try { globalThis.localStorage?.setItem('bible-translation', id); } catch {}
  }

  /**
   * Get chapter text for a label like "Geneza 1".
   * Uses local data for Cornilescu, Bolls.life API for others.
   */
  async getChapter(chapterLabel: string, translationId?: string): Promise<BibleChapter | null> {
    const tid = translationId ?? this.selectedTranslation();
    const { bookName, chapterNumber } = this.parseChapterLabel(chapterLabel);
    if (!bookName || !chapterNumber) return null;

    const bookNr = BOOK_NUMBER_MAP[bookName];
    if (!bookNr) return null;

    if (tid === 'local-cornilescu') {
      return this.getLocalChapter(bookName, chapterNumber, bookNr);
    }

    return this.getApiChapter(bookName, chapterNumber, bookNr, tid);
  }

  private getLocalChapter(bookName: string, chapterNumber: number, bookNr: number): BibleChapter | null {
    const raw = VERSE_INDEX.get(`${bookNr}:${chapterNumber}`);
    if (!raw || raw.length === 0) return null;

    const verses: BibleVerse[] = raw.map(v => ({
      verse: v.verse,
      text: v.text.trim(),
    }));

    return { bookName, chapterNumber, verses };
  }

  private async getApiChapter(bookName: string, chapterNumber: number, bookNr: number, translationId: string): Promise<BibleChapter | null> {
    const cacheKey = `${translationId}:${bookNr}:${chapterNumber}`;
    if (this.apiCache.has(cacheKey)) {
      return this.apiCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`https://bolls.life/get-chapter/${translationId}/${bookNr}/${chapterNumber}/`);
      if (!res.ok) return null;

      const data: { verse: number; text: string }[] = await res.json();
      const verses: BibleVerse[] = data.map(v => ({
        verse: v.verse,
        text: stripHtml(v.text),
      }));

      const chapter: BibleChapter = { bookName, chapterNumber, verses };
      this.apiCache.set(cacheKey, chapter);
      return chapter;
    } catch {
      return null;
    }
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
