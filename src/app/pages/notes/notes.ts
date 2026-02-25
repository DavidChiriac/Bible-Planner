import { Component, computed, effect, inject, signal } from '@angular/core';
import { Utils } from '../../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import BIBLE from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { NotesCursor } from '../../shared/services/firebase.service';
import { NoteItem } from '../../shared/models/note.models';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Note } from '../../shared/components/note/note';
import { ProgressSpinner } from 'primeng/progressspinner';
import { NotesService } from './notes.service';
import { SessionStorageService } from 'ngx-webstorage';

type SortBy = 'createdDate' | 'chapter';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-notes',
  imports: [
    NgClass,
    Button,
    MultiSelect,
    FormsModule,
    InputText,
    Dialog,
    Textarea,
    Select,
    Note,
    ProgressSpinner
  ],
  templateUrl: './notes.html',
  styleUrl: './notes.scss',
})
export class Notes {
  utils = inject(Utils);
  private readonly notesService = inject(NotesService);
  private readonly sessionStorageService = inject(SessionStorageService);

  // UI filters
  searchTerm = signal(this.sessionStorageService.retrieve('notes_searchTerm') ?? '');
  draftSearchTerm = signal(this.sessionStorageService.retrieve('notes_searchTerm') ?? '');
  books = BIBLE.map((b) => b.title);

  selectedBooks = signal<string[]>(this.sessionStorageService.retrieve('notes_selectedBooks') ?? []);
  selectedChapters = signal<string[]>(this.sessionStorageService.retrieve('notes_selectedChapters') ?? []);

  // Sorting
  sortOptions = [
    { label: 'Data adăugării (desc)', value: 'createdDate_desc' },
    { label: 'Data adăugării (asc)', value: 'createdDate_asc' },
    { label: 'Capitol (asc)', value: 'chapter_asc' },
    { label: 'Capitol (desc)', value: 'chapter_desc' },
  ]
  sort = signal<string>(this.sessionStorageService.retrieve('notes_sort') ?? this.sortOptions[0].value);
  sortBy = computed<SortBy>(() => this.sort().split('_')[0] as SortBy);
  sortDir = computed<SortDir>(() => this.sort().split('_')[1] as SortDir);

  // Add note
  addNoteVisible = signal(false);
  newNoteText = signal('');
  newNoteBook = signal<string | null>(null);
  newNoteChapter = signal<number | null>(null);

  filtersDialogVisible = signal(false);

  draftSelectedBooks = signal<string[]>(this.sessionStorageService.retrieve('notes_selectedBooks') ?? []);
  draftSelectedChapters = signal<string[]>(this.sessionStorageService.retrieve('notes_selectedChapters') ?? []);
  draftSort = signal<any>(this.sessionStorageService.retrieve('notes_sort') ?? null);

  chapters = computed(() => {
    const selectedBooks = this.selectedBooks();

    // If no book filter: show 1..max across all books
    if (!selectedBooks || selectedBooks.length === 0) {
      const maxAll = BIBLE.map((b) => b.chapters.length).reduce((a, b) => Math.max(a, b), 0);
      return Array.from({ length: maxAll }, (_, i) => i + 1);
    }

    const maxLength = BIBLE.filter((b) => selectedBooks.includes(b.title))
      .map((b) => b.chapters.length)
      .reduce((a, b) => Math.max(a, b), 0);

    return Array.from({ length: maxLength }, (_, i) => i + 1);
  });

  // Pagination state
  notes = signal<NoteItem[]>([]);
  loading = signal(false);
  cursor = signal<NotesCursor | undefined>(undefined);
  hasMore = signal(true);

  pageSize = 50;
  nextPageLoading = signal(false);

  constructor() {
    // Auto-reload when filters OR sorting changes
    effect(() => {
      const _term = this.searchTerm();
      const _books = this.selectedBooks();
      const _chapters = this.selectedChapters();
      const _sortBy = this.sortBy();
      const _sortDir = this.sortDir();

      this.sessionStorageService.store('notes_searchTerm', _term);
      this.sessionStorageService.store('notes_selectedBooks', _books);
      this.sessionStorageService.store('notes_selectedChapters', _chapters);
      this.sessionStorageService.store('notes_sort', `${_sortBy}_${_sortDir}`);

      void this.loadFirstPage();
    });

    // Optional behavior: if user clears book filter, clear chapter filter too
    effect(() => {
      const books = this.selectedBooks();
      if (!books || books.length === 0) {
        this.selectedChapters.set([]);
      }
    });
  }

  private normalizeChapterSelection(): number[] {
    return (this.selectedChapters() ?? [])
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
  }

  async loadFirstPage() {
    this.loading.set(true);
    this.cursor.set(undefined);
    this.notes.set([]);
    this.hasMore.set(true);

    const res = await this.notesService.getPaginatedNotes({
      pageSize: this.pageSize,
      cursor: { offset: 0 },
      search: this.searchTerm(),
      books: this.selectedBooks(),
      chapters: this.normalizeChapterSelection(),
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    });

    this.notes.set(res.items);
    this.cursor.set(res.nextCursor);
    this.hasMore.set(!!res.nextCursor);
    this.loading.set(false);
  }

  async loadNextPage() {
    if (this.loading() || !this.hasMore()) return;

    this.nextPageLoading.set(true);

    const res = await this.notesService.getPaginatedNotes({
      pageSize: this.pageSize,
      cursor: this.cursor(),
      search: this.searchTerm(),
      books: this.selectedBooks(),
      chapters: this.normalizeChapterSelection(),
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    });
    this.notes.update((prev) => [...prev, ...res.items]);
    this.cursor.set(res.nextCursor);
    this.hasMore.set(!!res.nextCursor);
    this.nextPageLoading.set(false);
  }

  async editNote(note: NoteItem) {
    this.notes.update((notes) => {
      const index = notes.findIndex((n) => n.key === note.key && n.chapterLabel === note.chapterLabel);
      if (index === -1) return notes;

      const newNotes = [...notes];
      newNotes[index] = note;
      return newNotes;
    });
  }

  deleteNote(note: NoteItem) {
    this.notes.update((notes) => {
      const index = notes.findIndex((n) => n.key === note.key && n.chapterLabel === note.chapterLabel);
      if (index === -1) return notes;

      const newNotes = [...notes];
      newNotes.splice(index, 1);
      return newNotes;
    });
  }

  addNewNote() {
    this.addNoteVisible.set(true);
    this.newNoteText.set('');
    this.newNoteBook.set(null);
    this.newNoteChapter.set(null);
  }

  async confirmAddNote() {
    const book = this.newNoteBook();
    const chapter = this.newNoteChapter();
    const text = this.newNoteText();

    if (!book || !chapter || !text) return;

    this.loading.set(true);

    const chapterLabel = `${book} ${chapter}`;

    await this.notesService.saveNote([chapterLabel], text);
    await this.loadFirstPage();

    this.loading.set(false);
    this.addNoteVisible.set(false);
    this.newNoteText.set('');
    this.newNoteBook.set(null);
    this.newNoteChapter.set(null);
  }

  getMaxChapterPerBook(): number {
    const selectedBook = this.newNoteBook();
    return BIBLE.find((b) => b.title === selectedBook)?.chapters.length ?? 0;
  }

  applyFilters() {
    this.selectedBooks.set([...this.draftSelectedBooks()]);
    this.selectedChapters.set([...this.draftSelectedChapters()]);
    this.sort.set(this.draftSort());
    this.filtersDialogVisible.set(false);

    this.cursor.set({ offset: 0 });
  }
}