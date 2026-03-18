import { Component, computed, effect, inject, signal } from '@angular/core';
import { Utils } from '../../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import BIBLE from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { NotesCursor } from '../../shared/services/firebase.service';
import { NoteItem, NOTE_TAGS, NoteTag } from '../../shared/models/note.models';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Dialog } from 'primeng/dialog';
import { QuillModule } from 'ngx-quill';
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
    QuillModule,
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
  newNoteTags = signal<NoteTag[]>([]);

  // Tags
  tagOptions = NOTE_TAGS;
  selectedTags = signal<NoteTag[]>(this.sessionStorageService.retrieve('notes_selectedTags') ?? []);
  draftSelectedTags = signal<NoteTag[]>(this.sessionStorageService.retrieve('notes_selectedTags') ?? []);

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
      const _tags = this.selectedTags();

      this.sessionStorageService.store('notes_searchTerm', _term);
      this.sessionStorageService.store('notes_selectedBooks', _books);
      this.sessionStorageService.store('notes_selectedChapters', _chapters);
      this.sessionStorageService.store('notes_sort', `${_sortBy}_${_sortDir}`);
      this.sessionStorageService.store('notes_selectedTags', _tags);

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
      tags: this.selectedTags(),
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
      tags: this.selectedTags(),
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
    this.newNoteTags.set([]);
  }

  async confirmAddNote() {
    const book = this.newNoteBook();
    const chapter = this.newNoteChapter();
    const text = this.newNoteText();

    if (!book || !chapter || !text) return;

    this.loading.set(true);

    const chapterLabel = `${book} ${chapter}`;

    await this.notesService.saveNote([chapterLabel], text, this.newNoteTags());
    await this.loadFirstPage();

    this.loading.set(false);
    this.addNoteVisible.set(false);
    this.newNoteText.set('');
    this.newNoteBook.set(null);
    this.newNoteChapter.set(null);
    this.newNoteTags.set([]);
  }

  getMaxChapterPerBook(): number {
    const selectedBook = this.newNoteBook();
    return BIBLE.find((b) => b.title === selectedBook)?.chapters.length ?? 0;
  }

  applyFilters() {
    this.selectedBooks.set([...this.draftSelectedBooks()]);
    this.selectedChapters.set([...this.draftSelectedChapters()]);
    this.selectedTags.set([...this.draftSelectedTags()]);
    this.sort.set(this.draftSort());
    this.filtersDialogVisible.set(false);

    this.cursor.set({ offset: 0 });
  }

  async exportNotes() {
    const notes = this.notes();
    if (!notes.length) return;

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, AlignmentType, NumberFormat, LevelFormat } = await import('docx');

    const children: InstanceType<typeof Paragraph>[] = [];

    // Title
    children.push(new Paragraph({
      text: 'Notițe Biblie',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }));

    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const tagStr = n.tags?.length ? ` [${n.tags.join(', ')}]` : '';
      const dateStr = new Date(n.createdDate).toLocaleDateString('ro-RO');

      // Chapter heading
      children.push(new Paragraph({
        children: [
          new TextRun({ text: n.chapterLabel + tagStr, bold: true, size: 26, color: '4C362D' }),
        ],
        spacing: { before: 200 },
      }));

      // Parse HTML content into runs
      const htmlContent = n.text || '';
      const parsed = this.parseHtmlToRuns(htmlContent, TextRun, Paragraph);
      children.push(...parsed);

      // Date
      children.push(new Paragraph({
        children: [
          new TextRun({ text: dateStr, italics: true, size: 18, color: '6B5A45' }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 },
      }));

      // Separator between notes
      if (i < notes.length - 1) {
        children.push(new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'B8A995' } },
          spacing: { after: 200 },
        }));
      }
    }

    const doc = new Document({
      numbering: {
        config: [{
          reference: 'notes-bullet',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
          }],
        }, {
          reference: 'notes-ordered',
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
          }],
        }],
      },
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `notite-biblie-${new Date().toISOString().split('T')[0]}.docx`;

    if (Capacitor.isNativePlatform()) {
      try {
        let perms = await Filesystem.checkPermissions();
        if (perms.publicStorage !== 'granted') {
          await Filesystem.requestPermissions();
        }

        // Convert blob to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });

        await Filesystem.writeFile({
          path: 'Download/' + fileName,
          data: base64,
          directory: Directory.ExternalStorage,
        });
        globalThis.alert(`Fișierul „${fileName}" a fost salvat în Downloads.`);
      } catch {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: await this.blobToBase64(blob),
          directory: Directory.Cache,
        });
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: 'Notițe Biblie', url: result.uri });
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }

  private parseHtmlToRuns(html: string, TextRun: any, Paragraph: any): any[] {
    const paragraphs: any[] = [];

    // Strip outer tags and split by block elements
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const blocks = temp.querySelectorAll('p, li, h1, h2, h3');
    if (blocks.length === 0) {
      // Plain text fallback
      const text = temp.textContent || '';
      if (text.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22 })],
        }));
      }
      return paragraphs;
    }

    blocks.forEach((block) => {
      const runs: any[] = [];
      this.extractRuns(block, runs, TextRun, false, false, false);
      const isList = block.tagName === 'LI';
      const parent = block.parentElement;
      const isOrdered = parent?.tagName === 'OL';

      const opts: any = {
        children: runs.length ? runs : [new TextRun({ text: ' ', size: 22 })],
      };

      if (isList) {
        opts.numbering = {
          reference: isOrdered ? 'notes-ordered' : 'notes-bullet',
          level: 0,
        };
      }

      paragraphs.push(new Paragraph(opts));
    });

    return paragraphs;
  }

  private extractRuns(node: Node, runs: any[], TextRun: any, bold: boolean, italic: boolean, underline: boolean): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        runs.push(new TextRun({
          text,
          bold,
          italics: italic,
          underline: underline ? {} : undefined,
          size: 22,
          color: '4C362D',
        }));
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName;
      const newBold = bold || tag === 'STRONG' || tag === 'B';
      const newItalic = italic || tag === 'EM' || tag === 'I';
      const newUnderline = underline || tag === 'U';

      for (const child of Array.from(el.childNodes)) {
        this.extractRuns(child, runs, TextRun, newBold, newItalic, newUnderline);
      }
    }
  }
}