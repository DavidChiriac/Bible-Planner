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
import { object, objectVal } from 'rxfire/database';
import { TABS } from '../../pages/home-page/home-page';
import Chapters from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { migrateChaptersSameRefIfNeeded } from './migration';
import { NoteItem } from '../models/note.models';

type BookDef = { title: string; chapters: string[] };

export const BIBLE_BOOKS: BookDef[] = Chapters;

export const CHAPTER_COUNT: Record<string, number> = Object.fromEntries(
  BIBLE_BOOKS.map((b) => [b.title, b.chapters.length])
);

type BookNode = {
  __all?: boolean;
  [chapter: string]: any;
};

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
    return /^[0-9]+$/.test(k);
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

  // ---------------- NOTES ----------------

  async saveNote(chapters: string[], note: string): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const noteRef = ref(this.db, `users/${u.uid}/notes`);

    const snapshot = await get(noteRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    const createdDate = new Date().toISOString();

    const updates: Record<string, { text: string; createdDate: string }> = {};

    for (const ch of chapters) {
      const chapterNotes: Record<string, any> = existingData?.[ch] ?? {};

      const indices = Object.keys(chapterNotes)
        .map(Number)
        .filter((n) => Number.isFinite(n));

      const nextIndex = indices.length ? Math.max(...indices) + 1 : 0;

      updates[`${ch}/${nextIndex}`] = {
        text: note,
        createdDate,
      };
    }

    await update(noteRef, updates);

    return 'note saved';
  }

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
      // Now chapterNotes is Record<string, { text: string; createdDate: string }>
      const chapterNotes: Record<
        string,
        { text: string; createdDate: string }
      > = data?.[ch] ?? {};
      console.log(`Chapter ${ch} notes raw:`, chapterNotes);
      const items = Object.keys(chapterNotes)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => {
          const note = chapterNotes[key];

          return {
            key,
            text: note.text,
            createdDate: note.createdDate,
          };
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

  async updateNote(
    chapter: string,
    key: string,
    newText: string
  ): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const noteItemRef = ref(
      this.db,
      `users/${u.uid}/notes/${chapter}/${key}`
    );

    // Get existing note to preserve createdDate
    const snapshot = await get(noteItemRef);
    if (!snapshot.exists()) {
      throw new Error('Note not found');
    }

    await update(noteItemRef, {
      text: newText,
    });

    return 'note updated';
  }
}
