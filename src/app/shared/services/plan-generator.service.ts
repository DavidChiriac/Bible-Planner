import { Injectable } from '@angular/core';
import { BIBLE_BOOKS } from './firebase.service';
import { IPlan } from '../models/plan.model';
import BibleWithVerses from '../../../assets/jsons/biblia_ro_capitole_cu_versete_complete.json';

export const OT_END_INDEX = 39; // indices 0–38 are OT

export interface CustomPlanConfig {
  books: string[];
  days: number;
  places?: number;
  startDate?: string;
  targetDate?: string;
  excludeCategories?: string[];
}

export type ExclusionCategory = 'genealogies' | 'law' | 'land' | 'tabernacle' | 'prophecies' | 'serviceAndArmy';

export const EXCLUSION_CATEGORIES: Record<ExclusionCategory, Set<string>> = {
  genealogies: new Set([
    'Geneza 5', 'Geneza 10', 'Geneza 36', 'Geneza 46',
    'Numeri 1', 'Numeri 2', 'Numeri 3', 'Numeri 4', 'Numeri 7', 'Numeri 26', 'Numeri 33',
    '1 Cronici 1', '1 Cronici 2', '1 Cronici 3', '1 Cronici 4', '1 Cronici 5',
    '1 Cronici 6', '1 Cronici 7', '1 Cronici 8', '1 Cronici 9',
    'Ezra 2', 'Ezra 8', 'Neemia 7', 'Neemia 11', 'Neemia 12',
  ]),
  law: new Set([
    'Leviticul 1', 'Leviticul 2', 'Leviticul 3', 'Leviticul 4', 'Leviticul 5',
    'Leviticul 6', 'Leviticul 7', 'Leviticul 11', 'Leviticul 12', 'Leviticul 13',
    'Leviticul 14', 'Leviticul 15', 'Leviticul 21', 'Leviticul 22',
    'Numeri 5', 'Numeri 6', 'Numeri 15', 'Numeri 18', 'Numeri 19',
    'Numeri 28', 'Numeri 29', 'Numeri 30',
  ]),
  land: new Set([
    'Iosua 12', 'Iosua 13', 'Iosua 14', 'Iosua 15', 'Iosua 16',
    'Iosua 17', 'Iosua 18', 'Iosua 19', 'Iosua 20', 'Iosua 21',
  ]),
  tabernacle: new Set([
    'Exodul 25', 'Exodul 26', 'Exodul 27', 'Exodul 28', 'Exodul 29', 'Exodul 30', 'Exodul 31',
    'Exodul 35', 'Exodul 36', 'Exodul 37', 'Exodul 38', 'Exodul 39', 'Exodul 40',
    '1 Împărați 6', '1 Împărați 7',
    '2 Cronici 3', '2 Cronici 4',
    'Ezechiel 40', 'Ezechiel 41', 'Ezechiel 42', 'Ezechiel 43', 'Ezechiel 44',
    'Ezechiel 45', 'Ezechiel 46', 'Ezechiel 47', 'Ezechiel 48',
  ]),
  prophecies: new Set([
    'Isaia 13', 'Isaia 14', 'Isaia 15', 'Isaia 16', 'Isaia 17', 'Isaia 18',
    'Isaia 19', 'Isaia 20', 'Isaia 21', 'Isaia 22', 'Isaia 23',
    'Ieremia 46', 'Ieremia 47', 'Ieremia 48', 'Ieremia 49', 'Ieremia 50', 'Ieremia 51',
    'Ezechiel 25', 'Ezechiel 26', 'Ezechiel 27', 'Ezechiel 28',
    'Ezechiel 29', 'Ezechiel 30', 'Ezechiel 31', 'Ezechiel 32',
  ]),
  serviceAndArmy: new Set([
    '1 Cronici 23', '1 Cronici 24', '1 Cronici 25', '1 Cronici 26', '1 Cronici 27',
    'Numeri 31',
    '2 Cronici 31',
  ]),
};

/** Verse count lookup: "Geneza 1" → 31 */
const VERSE_MAP: Record<string, number> = {};
for (const book of BibleWithVerses) {
  for (const ch of book.chapters) {
    VERSE_MAP[ch.chapter] = ch.verses;
  }
}

export function getVerseCount(chapterLabel: string): number {
  return VERSE_MAP[chapterLabel] ?? 0;
}

@Injectable({ providedIn: 'root' })
export class PlanGeneratorService {

  /** Generate an IPlan[] from a user-defined config */
  generate(config: CustomPlanConfig): IPlan[] {
    const selectedBooks = this.gatherBooks(config.books, config.excludeCategories);
    const totalDays = config.days * (config.places ?? 1);
    if (selectedBooks.length === 0 || totalDays <= 0) return [];

    const days = this.distributeByBookProportion(selectedBooks, totalDays);
    return this.groupIntoWeeks(days);
  }

  /** Gather selected books with their chapters in canonical order */
  private gatherBooks(selectedTitles: string[], excludeCategories?: string[]): { title: string; chapters: string[] }[] {
    const set = new Set(selectedTitles);
    const excluded = this.buildExcludedSet(excludeCategories);
    return BIBLE_BOOKS
      .filter(b => set.has(b.title))
      .map(b => ({ title: b.title, chapters: b.chapters.filter(ch => !excluded.has(ch)) }))
      .filter(b => b.chapters.length > 0);
  }

  private buildExcludedSet(categories?: string[]): Set<string> {
    if (!categories || categories.length === 0) return new Set();
    const excluded = new Set<string>();
    for (const cat of categories) {
      const chapters = EXCLUSION_CATEGORIES[cat as ExclusionCategory];
      if (chapters) {
        for (const ch of chapters) excluded.add(ch);
      }
    }
    return excluded;
  }

  /** Allocate days to each book proportionally by verse count,
   *  then distribute each book's chapters evenly across its days.
   *  Consecutive small books are merged into groups that share days. */
  private distributeByBookProportion(
    books: { title: string; chapters: string[] }[],
    totalDays: number
  ): { chapters: string[]; label: string }[] {
    const totalVerses = books.reduce(
      (sum, b) => sum + b.chapters.reduce((s, ch) => s + getVerseCount(ch), 0), 0
    );
    const avgDailyVerses = totalVerses / totalDays;

    // Merge consecutive small books into groups
    const groups = this.mergeSmallBooks(books, avgDailyVerses);

    // Compute verse totals per group
    const groupVerses = groups.map(g =>
      g.reduce((sum, ch) => sum + getVerseCount(ch), 0)
    );
    const groupTotalVerses = groupVerses.reduce((a, b) => a + b, 0);

    // Allocate days proportionally
    const daysPerGroup = this.allocateDays(groupVerses, groupTotalVerses, totalDays);

    // Distribute each group's chapters across its allocated days
    const allDays: { chapters: string[]; label: string }[] = [];
    for (let g = 0; g < groups.length; g++) {
      const groupDays = this.distributeBookChapters(groups[g], daysPerGroup[g]);
      allDays.push(...groupDays);
    }

    return allDays;
  }

  /** Merge consecutive small books (verse total < avgDailyVerses) into combined groups.
   *  Large books remain as their own group. */
  private mergeSmallBooks(
    books: { title: string; chapters: string[] }[],
    avgDailyVerses: number
  ): string[][] {
    const groups: string[][] = [];
    let currentGroup: string[] = [];
    let currentGroupVerses = 0;

    for (const book of books) {
      const bookVersesTotal = book.chapters.reduce((s, ch) => s + getVerseCount(ch), 0);

      if (bookVersesTotal >= avgDailyVerses) {
        // Flush any accumulated small-book group (merge into previous if too small)
        this.flushTrailingGroup(groups, currentGroup, currentGroupVerses, avgDailyVerses);
        currentGroup = [];
        currentGroupVerses = 0;
        // Large book gets its own group
        groups.push([...book.chapters]);
      } else {
        // Small book — accumulate
        currentGroup.push(...book.chapters);
        currentGroupVerses += bookVersesTotal;
        if (currentGroupVerses >= avgDailyVerses) {
          groups.push(currentGroup);
          currentGroup = [];
          currentGroupVerses = 0;
        }
      }
    }

    this.flushTrailingGroup(groups, currentGroup, currentGroupVerses, avgDailyVerses);
    return groups;
  }

  private flushGroup(groups: string[][], group: string[]): void {
    if (group.length > 0) groups.push(group);
  }

  private flushTrailingGroup(
    groups: string[][], group: string[], groupVerses: number, avgDailyVerses: number
  ): void {
    if (group.length === 0) return;
    if (groups.length > 0 && groupVerses < avgDailyVerses * 0.5) {
      const lastGroupVerses = groups.at(-1)!.reduce((s, ch) => s + getVerseCount(ch), 0);
      if (lastGroupVerses < avgDailyVerses * 2) {
        groups.at(-1)!.push(...group);
        return;
      }
    }
    groups.push(group);
  }

  /** Largest-remainder method to allocate integer days proportionally */
  private allocateDays(bookVerses: number[], totalVerses: number, totalDays: number): number[] {
    const exact = bookVerses.map(v => (v / totalVerses) * totalDays);
    const floored = exact.map(v => Math.max(1, Math.floor(v))); // at least 1 day per book
    let remaining = totalDays - floored.reduce((a, b) => a + b, 0);

    // Distribute remaining days by largest fractional remainder
    const remainders = exact.map((v, i) => ({ i, r: v - floored[i] }));
    remainders.sort((a, b) => b.r - a.r);

    for (const { i } of remainders) {
      if (remaining <= 0) break;
      floored[i]++;
      remaining--;
    }

    return floored;
  }

  /** Distribute one book's chapters evenly across N days by verse count */
  private distributeBookChapters(
    chapters: string[],
    bookDays: number
  ): { chapters: string[]; label: string }[] {
    const count = chapters.length;
    const daysActual = Math.min(bookDays, count);
    if (daysActual <= 0) return [{ chapters, label: this.buildDayLabel(chapters) }];

    const verses = chapters.map(ch => getVerseCount(ch));
    const prefix = new Array<number>(count + 1);
    prefix[0] = 0;
    for (let i = 0; i < count; i++) {
      prefix[i + 1] = prefix[i] + verses[i];
    }

    // Greedy with recalculated target: after each split, recompute
    // the target based on remaining verses and remaining days
    const days: { chapters: string[]; label: string }[] = [];
    let startIdx = 0;

    for (let d = 0; d < daysActual; d++) {
      if (d === daysActual - 1) {
        // Last day gets everything remaining
        const slice = chapters.slice(startIdx);
        days.push({ chapters: slice, label: this.buildDayLabel(slice) });
        break;
      }

      const remainingVerses = prefix[count] - prefix[startIdx];
      const remainingDays = daysActual - d;
      const dayTarget = remainingVerses / remainingDays;

      // Find the best split: the index where stopping minimizes
      // the difference from dayTarget
      let bestEnd = startIdx + 1;
      let bestDiff = Infinity;

      for (let end = startIdx + 1; end <= count - (remainingDays - 1); end++) {
        const dayVerses = prefix[end] - prefix[startIdx];
        const diff = Math.abs(dayVerses - dayTarget);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestEnd = end;
        }
        // Once we've passed the target, no point going further
        if (dayVerses > dayTarget) break;
      }

      const slice = chapters.slice(startIdx, bestEnd);
      days.push({ chapters: slice, label: this.buildDayLabel(slice) });
      startIdx = bestEnd;
    }

    return days;
  }

  /** Group days into weeks of 7 */
  private groupIntoWeeks(
    days: { chapters: string[]; label: string }[]
  ): IPlan[] {
    const weeks: IPlan[] = [];

    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      const weekNum = Math.floor(i / 7) + 1;

      const firstCh = weekDays[0].chapters[0];
      const lastCh = weekDays.at(-1)?.chapters.at(-1);

      weeks.push({
        week: weekNum,
        label: firstCh === lastCh ? firstCh : `${firstCh} – ${lastCh}`,
        days: weekDays,
      });
    }

    return weeks;
  }

  /** Build a human-readable label for a day's chapters */
  private buildDayLabel(chapters: string[]): string {
    if (chapters.length === 0) return '';
    if (chapters.length === 1) return chapters[0];

    // Group consecutive chapters by book
    const groups: { book: string; start: number; end: number }[] = [];
    for (const ch of chapters) {
      const { book, num } = this.parseChapter(ch);
      const last = groups.at(-1);
      if (last?.book === book && num === last.end + 1) {
        last.end = num;
      } else {
        groups.push({ book, start: num, end: num });
      }
    }

    return groups
      .map(g =>
        g.start === g.end
          ? `${g.book} ${g.start}`
          : `${g.book} ${g.start}-${g.end}`
      )
      .join(', ');
  }

  private parseChapter(label: string): { book: string; num: number } {
    const lastSpace = label.lastIndexOf(' ');
    return {
      book: label.slice(0, lastSpace),
      num: Number(label.slice(lastSpace + 1)),
    };
  }
}
