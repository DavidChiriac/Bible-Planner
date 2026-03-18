import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import {
  child,
  get,
  ref,
  remove,
  update,
} from 'firebase/database';
import Chapters from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { NoteItem, NoteTag } from '../../shared/models/note.models';

type BookDef = { title: string; chapters: string[] };

export const BIBLE_BOOKS: BookDef[] = Chapters;

export const CHAPTER_COUNT: Record<string, number> = Object.fromEntries(
  BIBLE_BOOKS.map((b) => [b.title, b.chapters.length])
);

export type NotesCursor = {
  offset: number;
};

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly auth = inject(Auth);
  private readonly db = inject(Database);

  readonly user$ = user(this.auth);

  async saveNote(chapters: string[], note: string, tags: NoteTag[] = []): Promise<string> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const noteRef = ref(this.db, `users/${u.uid}/notes`);

    const snapshot = await get(noteRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    const createdDate = new Date().toISOString();

    const updates: Record<string, { text: string; createdDate: string; tags?: NoteTag[] }> = {};

    for (const ch of chapters) {
      const chapterNotes: Record<string, any> = existingData?.[ch] ?? {};

      const indices = Object.keys(chapterNotes)
        .map(Number)
        .filter((n) => Number.isFinite(n));

      const nextIndex = indices.length ? Math.max(...indices) + 1 : 0;

      const noteData: { text: string; createdDate: string; tags?: NoteTag[] } = {
        text: note,
        createdDate,
      };
      if (tags.length > 0) noteData.tags = tags;

      updates[`${ch}/${nextIndex}`] = noteData;
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
      // Now chapterNotes is Record<string, { text: string; createdDate: string; tags?: NoteTag[] }>
      const chapterNotes: Record<
        string,
        { text: string; createdDate: string; tags?: NoteTag[] }
      > = data?.[ch] ?? {};
      const items = Object.keys(chapterNotes)
        .map((key) => {
          const note = chapterNotes[key];
          const parsed = this.parseChapterLabel(ch);

          return {
            key,
            text: note.text,
            createdDate: note.createdDate,
            book: parsed?.book ?? '',
            chapter: parsed?.chapter ?? 0,
            chapterLabel: ch,
            tags: note.tags ?? [],
          };
        })
        .sort((a, b) => Date.parse(b.createdDate) - Date.parse(a.createdDate));

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
    newText: string,
    newTags?: NoteTag[]
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

    const updates: Record<string, any> = { text: newText };
    if (newTags !== undefined) updates['tags'] = newTags.length > 0 ? newTags : null;

    await update(noteItemRef, updates);

    return 'note updated';
  }

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

  async getPaginatedNotes(params: {
    pageSize: number;
    cursor?: NotesCursor;

    // filters (all optional)
    search?: string; // case-insensitive contains in note text
    books?: string[]; // multiple books
    chapters?: Array<number | string>; // multiple chapters
    tags?: NoteTag[]; // filter by tags

    // sorting
    sortBy?: 'createdDate' | 'chapter' | null;
    sortDir?: 'asc' | 'desc' | null;
  }): Promise<{ items: NoteItem[]; nextCursor?: NotesCursor }> {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const {
      pageSize,
      search = '',
      books = [],
      chapters = [],
      tags = [],
      sortBy = 'createdDate',
      sortDir = 'asc',
    } = params;

    const term = search.trim().toLowerCase();
    const bookSet = new Set((books ?? []).map((b) => (b ?? '').trim()).filter(Boolean));
    const chapterSet = new Set(
      (chapters ?? [])
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0)
    );
    const tagSet = new Set(tags ?? []);

    const notesRootRef = ref(this.db, `users/${u.uid}/notes`);
    const snap = await get(notesRootRef);

    if (!snap.exists()) return { items: [] };

    const tree: Record<
      string,
      Record<string, { text: string; createdDate: string; tags?: NoteTag[] }>
    > = snap.val() ?? {};

    let all = this.flattenNotesTree(tree, bookSet, chapterSet);

    // 4) Global search (case-insensitive contains) on note text
    if (term) {
      all = all.filter((n) => (n.text ?? '').toLowerCase().includes(term));
    }

    // 4b) Filter by tags (if provided)
    if (tagSet.size > 0) {
      all = all.filter((n) => (n.tags ?? []).some(t => tagSet.has(t)));
    }

    // 5) Sort (stable): primary sort (createdDate or chapter), then chapterLabel, then key
    all.sort((a, b) => {
      let result = 0;

      if (sortBy === 'createdDate') {
        result = (a.createdDate ?? '').localeCompare(b.createdDate ?? '');
      } else {
        result = (a.chapter ?? 0) - (b.chapter ?? 0);
      }

      // stable fallback 1: chapterLabel
      if (result === 0) {
        const c = (a.chapterLabel ?? '').localeCompare(b.chapterLabel ?? '');
        if (c !== 0) result = c;
      }

      // stable fallback 2: key (numeric if possible)
      if (result === 0) {
        const an = Number(a.key);
        const bn = Number(b.key);
        if (Number.isFinite(an) && Number.isFinite(bn)) result = an - bn;
        else result = (a.key ?? '').localeCompare(b.key ?? '');
      }

      return sortDir === 'desc' ? -result : result;
    });

    // 6) Apply cursor (client-side)
    const startIndex = params.cursor?.offset ?? 0;

    const items = all.slice(startIndex, startIndex + pageSize);

    const nextOffset = startIndex + items.length;
    const nextCursor =
      nextOffset < all.length ? { offset: nextOffset } : undefined;

    return { items, nextCursor };
  }

  private flattenNotesTree(
    tree: Record<string, Record<string, { text: string; createdDate: string; tags?: NoteTag[] }>>,
    bookSet: Set<string>,
    chapterSet: Set<number>
  ): NoteItem[] {
    const all: NoteItem[] = [];

    for (const [chapterLabel, chapterNotes] of Object.entries(tree)) {
      const parsed = this.parseChapterLabel(chapterLabel);
      if (!parsed) continue;

      if (bookSet.size > 0 && !bookSet.has(parsed.book)) continue;
      if (chapterSet.size > 0 && !chapterSet.has(parsed.chapter)) continue;

      for (const [key, note] of Object.entries(chapterNotes ?? {})) {
        all.push({
          key,
          text: note?.text ?? '',
          createdDate: note?.createdDate ?? '',
          book: parsed.book,
          chapter: parsed.chapter,
          chapterLabel,
          tags: note?.tags ?? [],
        });
      }
    }

    return all;
  }
}
