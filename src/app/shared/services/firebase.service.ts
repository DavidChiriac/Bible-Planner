import { inject, Injectable } from '@angular/core';
import { Auth, signOut, user, getAuth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import {
  child,
  get,
  ref,
  remove,
  runTransaction,
  update,
} from 'firebase/database';
import { Observable, switchMap, of, map } from 'rxjs';
import { objectVal } from 'rxfire/database';
import { TABS } from '../../pages/home-page/home-page';
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

export type NoteItem = { key: string; text: string };

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

  getStartDate(): Observable<string> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of('');
        const startDateRef = ref(this.db, `users/${u.uid}/startDate`);
        return objectVal<string>(startDateRef);
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

  getMonths(): Observable<number> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of(0);
        const monthsRef = ref(this.db, `users/${u.uid}/months`);
        return objectVal<number>(monthsRef);
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
    return /^[0-9]+$/.test(k);
  }

  getChapters(): Observable<string[]> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        return objectVal<Record<string, BookNode> | null>(
          this.chaptersRoot(u.uid)
        );
      }),
      map((tree) => {
        if (!tree) return [];

        const out: string[] = [];

        for (const [book, node] of Object.entries(tree)) {
          if (!node) continue;

          const count = CHAPTER_COUNT[book];
          const all = node.__all === true;

          if (all) {
            if (Number.isInteger(count) && count > 0) {
              for (let i = 1; i <= count; i++) out.push(`${book} ${i}`);
            }
            continue;
          }

          const nums = Object.keys(node)
            .filter((k) => this.isNumericKey(k) && node[k] === true)
            .map(Number)
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);

          for (const n of nums) out.push(`${book} ${n}`);
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

  getPlan(): Observable<TABS> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of(TABS.INORDINE);
        const selectedPlanRef = ref(this.db, `users/${u.uid}/selectedPlan`);
        return objectVal<TABS>(selectedPlanRef);
      })
    );
  }

  async ensureChaptersMigrated(): Promise<void> {
    const u = this.auth.currentUser;
    if (!u) return;

    await migrateChaptersSameRefIfNeeded(this.db, u.uid);
  }

  // ---------------- NOTES ----------------

  async saveNote(chapters: string[], note: string): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const noteRef = ref(this.db, `users/${u.uid}/notes`);

    const snapshot = await get(noteRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    const updates: Record<string, string> = {};

    for (const ch of chapters) {
      const chapterNotes = existingData?.[ch] ?? {};

      const indices = Object.keys(chapterNotes)
        .map(Number)
        .filter((n) => Number.isFinite(n));

      const nextIndex = indices.length ? Math.max(...indices) + 1 : 0;

      updates[`${ch}/${nextIndex}`] = note;
    }

    await update(noteRef, updates);

    return 'note saved';
  }

  /**
   * Fetch notes with stable keys (so UI can delete the exact clicked one).
   * Returns: { chapter: [{key:'0', text:'...'}, ...] }
   */
  async getNoteItemsForChapters(
    chapters: string[]
  ): Promise<Record<string, NoteItem[]>> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const notesRef = ref(this.db, `users/${u.uid}/notes`);
    const snapshot = await get(notesRef);
    const data = snapshot.exists() ? snapshot.val() : {};

    const result: Record<string, NoteItem[]> = {};

    for (const ch of chapters) {
      const chapterNotes: Record<string, string> = data?.[ch] ?? {};

      const items = Object.keys(chapterNotes)
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b)
        .map((n) => {
          const key = String(n);
          return { key, text: chapterNotes[key] };
        });

      result[ch] = items;
    }

    return result;
  }

  /**
   * Delete a note by its key (deletes exactly one instance even if duplicates exist).
   */
  async deleteNoteByKey(chapter: string, key: string): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chapterRef = ref(this.db, `users/${u.uid}/notes/${chapter}`);

    // remove(childRef) deletes only that specific key
    await remove(child(chapterRef, key));

    return 'note deleted';
  }

  // (Optional) Keep your old API if other code calls it.
  // This deletes the first matching by text; not used by Day anymore.
  async deleteNote(chapter: string, note: string): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chapterRef = ref(this.db, `users/${u.uid}/notes/${chapter}`);

    const snapshot = await get(chapterRef);
    if (!snapshot.exists()) return 'no notes to delete';

    const chapterNotes: Record<string, string> = snapshot.val();

    const matchKey = Object.keys(chapterNotes)
      .map((k) => ({ key: k, idx: Number(k) }))
      .filter((x) => Number.isFinite(x.idx))
      .sort((a, b) => a.idx - b.idx)
      .find((x) => chapterNotes[x.key] === note)?.key;

    if (!matchKey) return 'note not found';

    await remove(child(chapterRef, matchKey));
    return 'note deleted';
  }
}
