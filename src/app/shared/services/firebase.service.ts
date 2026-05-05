import { inject, Injectable } from '@angular/core';
import { Auth, signOut, user, getAuth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import {
  child,
  get,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from 'firebase/database';
import { Observable, switchMap, of, map } from 'rxjs';
import { object, objectVal } from 'rxfire/database';
import { TABS } from '../../pages/plans/plans';
import Chapters from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { migrateChaptersSameRefIfNeeded } from './migration';

type BookDef = { title: string; chapters: string[] };

export const BIBLE_BOOKS: BookDef[] = Chapters;

export const CHAPTER_COUNT: Record<string, number> = Object.fromEntries(
  BIBLE_BOOKS.map((b) => [b.title, b.chapters.length])
);

type BookNode = {
  __all?: boolean;
  [chapter: string]: any;
};

export type NotesCursor = {
  offset: number;
};

export interface PlanHistoryEntry {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  chaptersRead: number;
  totalChapters: number;
  completionPercentage: number;
  books?: string[];
  days?: number;
  places?: number;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly auth = inject(Auth);
  private readonly db = inject(Database);

  readonly user$ = user(this.auth);

  async logout() {
    await signOut(this.auth);
  }

  getAuth() {
    return getAuth();
  }

  getStartDate() {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of(undefined as string | undefined);

        const r = ref(this.db, `users/${u.uid}/startDate`);

        return object(r).pipe(
          map(change => {
            const snap = change.snapshot;
            return snap.exists() ? (snap.val() as string) : undefined;
          })
        );
      })
    );
  }

  async setStartDate(date: string): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const startDateRef = ref(this.db, `users/${u.uid}/startDate`);

    await runTransaction(startDateRef, () => {
      return date;
    });

    return 'added';
  }

  getMonths() {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of(undefined as number | undefined);

        const r = ref(this.db, `users/${u.uid}/months`);

        return object(r).pipe(
          map(change => {
            const snap = change.snapshot;
            return snap.exists() ? (snap.val() as number) : undefined;
          })
        );
      })
    );
  }

  async setMonths(months: number): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const monthsRef = ref(this.db, `users/${u.uid}/months`);

    await runTransaction(monthsRef, () => {
      return months;
    });

    return 'added';
  }

  private chaptersRoot(uid: string) {
    return ref(this.db, `users/${uid}/chapters`);
  }

  /** Parse: book = everything before last number, chapter = last number */
  private parseChapterLabel(
    label: string
  ): { book: string; chapter: number } | null {
    const trimmed = (label ?? '').trim();
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace === -1) return null;

    const book = trimmed.slice(0, lastSpace).trim();
    const chapterStr = trimmed.slice(lastSpace + 1).trim();
    const chapter = Number(chapterStr);

    if (!book || !Number.isInteger(chapter) || chapter <= 0) return null;
    return { book, chapter };
  }

  private isNumericKey(k: string) {
    return /^\d+$/.test(k);
  }

  getChapters(): Observable<string[]> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of(null);
        return objectVal<Record<string, BookNode> | null>(
          this.chaptersRoot(u.uid)
        );
      }),
      map((tree) => {
        if (!tree) return [];

        const out: string[] = [];

        const addAllChapters = (book: string, count: number) => {
          for (let i = 1; i <= count; i++) out.push(`${book} ${i}`);
        };

        const addSpecificChapters = (book: string, node: BookNode) => {
          const nums = Object.keys(node)
            .filter((k) => this.isNumericKey(k) && node[k] === true)
            .map(Number)
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);

          for (const n of nums) out.push(`${book} ${n}`);
        };

        for (const [book, node] of Object.entries(tree)) {
          if (!node) continue;

          const count = CHAPTER_COUNT[book];
          const all = node.__all === true;

          if (all) {
            if (Number.isInteger(count) && count > 0) {
              addAllChapters(book, count);
            }
            continue;
          }

          addSpecificChapters(book, node);
        }

        return Array.from(new Set(out));
      })
    );
  }

  async addChapters(newChapters: string[]): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const byBook = new Map<string, Set<number>>();
    for (const label of newChapters) {
      const p = this.parseChapterLabel(label);
      if (!p) continue;

      const max = CHAPTER_COUNT[p.book];
      if (max && p.chapter > max) continue;

      if (!byBook.has(p.book)) byBook.set(p.book, new Set<number>());
      byBook.get(p.book)!.add(p.chapter);
    }

    const root = this.chaptersRoot(u.uid);

    for (const [book, chaptersSet] of byBook.entries()) {
      const bookRef = child(root, book);
      const bookTotal = CHAPTER_COUNT[book] ?? 0;

      await runTransaction(bookRef, (current: BookNode | null) => {
        const node: BookNode =
          current && typeof current === 'object' ? current : {};

        if (node.__all === true) return node;

        for (const ch of chaptersSet) node[String(ch)] = true;

        if (bookTotal > 0) {
          let readCount = 0;
          for (const k of Object.keys(node)) {
            if (this.isNumericKey(k) && node[k] === true) readCount++;
          }

          if (readCount >= bookTotal) {
            return { __all: true };
          }
        }

        return node;
      });
    }

    return 'added';
  }

  async deleteChapters(chaptersToDelete: string[]): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const byBook = new Map<string, Set<number>>();
    for (const label of chaptersToDelete) {
      const p = this.parseChapterLabel(label);
      if (!p) continue;

      const max = CHAPTER_COUNT[p.book];
      if (max && p.chapter > max) continue;

      if (!byBook.has(p.book)) byBook.set(p.book, new Set<number>());
      byBook.get(p.book)!.add(p.chapter);
    }

    const root = this.chaptersRoot(u.uid);

    let touched = false;

    for (const [book, delSet] of byBook.entries()) {
      const bookRef = child(root, book);
      const bookTotal = CHAPTER_COUNT[book] ?? 0;

      const res = await runTransaction(bookRef, (current: BookNode | null) => {
        if (current == null) return current;

        const node: BookNode = typeof current === 'object' ? current : {};
        const isAll = node.__all === true;

        if (isAll) {
          if (bookTotal <= 0) return node;

          const newNode: BookNode = {};
          for (let i = 1; i <= bookTotal; i++) {
            if (!delSet.has(i)) newNode[String(i)] = true;
          }
          return Object.keys(newNode).length === 0 ? null : newNode;
        }

        for (const ch of delSet) delete node[String(ch)];

        const stillHasAny = Object.keys(node).some(
          (k) => this.isNumericKey(k) && node[k] === true
        );
        return stillHasAny ? node : null;
      });

      if (res.committed) touched = true;
    }

    return touched ? 'deleted' : 'nothing to delete';
  }

  async markBookComplete(book: string): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const root = this.chaptersRoot(u.uid);
    await update(ref(this.db), {
      [`${root.toString()}/${book}`]: { __all: true },
    });
  }

  async resetProgress(): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
    await remove(chaptersRef);
    const favouritesRef = ref(this.db, `users/${u.uid}/favouriteWeeks`);
    await remove(favouritesRef);
    const startDateRef = ref(this.db, `users/${u.uid}/startDate`);
    await remove(startDateRef);
    const monthsRef = ref(this.db, `users/${u.uid}/months`);
    await remove(monthsRef);
    return 'progress reset';
  }

  async setSelectedPlan(plan: string = ''): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const selectedPlanRef = ref(this.db, `users/${u.uid}/selectedPlan`);

    await runTransaction(selectedPlanRef, () => {
      return plan;
    });

    return 'selected plan updated';
  }

  getPlan(): Observable<TABS | null> {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of(null);
        return objectVal<TABS>(ref(this.db, `users/${u.uid}/selectedPlan`));
      })
    );
  }

  async ensureChaptersMigrated(): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) return;

    await migrateChaptersSameRefIfNeeded(this.db, u.uid);
  }

  // --------------------- SELECTED TRANSLATION ----------------

  getSelectedTranslation$(): Observable<string | null> {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of(null);
        return objectVal<string | null>(ref(this.db, `users/${u.uid}/selectedTranslation`));
      }),
      map(v => v ?? null)
    );
  }

  async setSelectedTranslation(translationId: string): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const translationRef = ref(this.db, `users/${u.uid}/selectedTranslation`);
    await runTransaction(translationRef, () => translationId);
  }

  // --------------------- FAVOURITE WEEKS ----------------

  async addFavouriteWeek(plan: TABS, week: number): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const favsRef = ref(this.db, `users/${u.uid}/favouriteWeeks`);

    await runTransaction(favsRef, (current) => {
      const arr = Array.isArray(current) ? current : [];
      if (arr.some(f => f.plan === plan && f.week === week)) return arr;
      return [...arr, { plan, week }];
    });
  }

  async deleteFavouriteWeek(plan: TABS, week: number): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const favsRef = ref(this.db, `users/${u.uid}/favouriteWeeks`);

    const res = await runTransaction(favsRef, (current) => {
      const existing: { plan: TABS; week: number }[] = Array.isArray(current) ? current : [];
      const filtered = existing.filter(f => !(f.plan === plan && f.week === week));
      return filtered.length ? filtered : []; // or return null if you want to delete the node entirely
    });

    return res.committed ? 'week removed from favourites' : 'no change';
  }

  getFavouriteWeeks$() {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of([]);
        return objectVal<{ plan: TABS; week: number }[] | null>(
          ref(this.db, `users/${u.uid}/favouriteWeeks`)
        );
      }),
      map(v => Object.values(v ?? []))
    );
  }

  // --------------------- CUSTOM PLAN CONFIG ----------------

  getCustomPlanConfig$(): Observable<{ books: string[]; days: number; places?: number; startDate?: string; targetDate?: string; excludeCategories?: string[] } | null> {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of(null);
        return objectVal<{ books: string[]; days: number; places?: number; startDate?: string; targetDate?: string; excludeCategories?: string[] } | null>(
          ref(this.db, `users/${u.uid}/customPlanConfig`)
        );
      })
    );
  }

  async setCustomPlanConfig(config: { books: string[]; days: number; places?: number; startDate?: string; targetDate?: string; excludeCategories?: string[] }): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const configRef = ref(this.db, `users/${u.uid}/customPlanConfig`);
    await runTransaction(configRef, () => config);
  }

  async deleteCustomPlanConfig(): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    await remove(ref(this.db, `users/${u.uid}/customPlanConfig`));
  }

  async saveWidgetData(data: { progress: string; status: string; step: string; stepType: string; todayReading: string }): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) return;
    await set(ref(this.db, `users/${u.uid}/widgetData`), data);
  }

  // --------------------- PLAN HISTORY ----------------

  async savePlanHistory(entry: Omit<PlanHistoryEntry, 'id'>): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    // DB-level duplicate guard: reject if same startDate already exists
    const historyRef = ref(this.db, `users/${u.uid}/planHistory`);
    const snapshot = await get(historyRef);
    if (snapshot.exists()) {
      const existing = Object.values(snapshot.val() as Record<string, PlanHistoryEntry>);
      if (existing.some(e => e.startDate === entry.startDate)) {
        throw new Error('Plan already saved');
      }
    }

    const id = String(Date.now());
    await set(ref(this.db, `users/${u.uid}/planHistory/${id}`), { ...entry, id });
  }

  getPlanHistory$(): Observable<PlanHistoryEntry[]> {
    return this.user$.pipe(
      switchMap(u => {
        if (!u) return of([]);
        return objectVal<Record<string, PlanHistoryEntry> | null>(
          ref(this.db, `users/${u.uid}/planHistory`)
        );
      }),
      map(data => {
        if (!data) return [];
        return Object.values(data).sort((a, b) => Number(b.id) - Number(a.id));
      })
    );
  }
}
