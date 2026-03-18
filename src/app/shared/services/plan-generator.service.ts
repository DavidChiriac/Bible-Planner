import { Injectable } from '@angular/core';
import { BIBLE_BOOKS } from './firebase.service';
import { IPlan } from '../models/plan.model';

export const OT_END_INDEX = 39; // indices 0–38 are OT

export interface CustomPlanConfig {
  books: string[];
  days: number;
  startDate?: string;
}

@Injectable({ providedIn: 'root' })
export class PlanGeneratorService {

  /** Generate an IPlan[] from a user-defined config */
  generate(config: CustomPlanConfig): IPlan[] {
    const allChapters = this.gatherChapters(config.books);
    if (allChapters.length === 0 || config.days <= 0) return [];

    const days = this.distributeChapters(allChapters, config.days);
    return this.groupIntoWeeks(days);
  }

  /** Gather all chapter labels for the selected books, in canonical order */
  private gatherChapters(selectedTitles: string[]): string[] {
    const set = new Set(selectedTitles);
    return BIBLE_BOOKS
      .filter(b => set.has(b.title))
      .flatMap(b => b.chapters);
  }

  /** Distribute chapters as evenly as possible across N days */
  private distributeChapters(
    chapters: string[],
    totalDays: number
  ): { chapters: string[]; label: string }[] {
    const count = chapters.length;
    const daysActual = Math.min(totalDays, count);
    const base = Math.floor(count / daysActual);
    const extra = count % daysActual;

    const days: { chapters: string[]; label: string }[] = [];
    let idx = 0;

    for (let d = 0; d < daysActual; d++) {
      const size = base + (d < extra ? 1 : 0);
      const slice = chapters.slice(idx, idx + size);
      idx += size;

      days.push({
        chapters: slice,
        label: this.buildDayLabel(slice),
      });
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
