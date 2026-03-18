import { Component, computed, inject, signal } from '@angular/core';
import { Utils } from '../../../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TABS } from '../home-page';
import CRONOLOGIC from '../../../../assets/jsons/plan_biblie_cronologic_cornilescu_pe_zile.json';
import INORDINE from '../../../../assets/jsons/plan_biblie_in_ordine_pe_saptamani.json';
import { IPlan } from '../../../shared/models/plan.model';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MultiSelect } from 'primeng/multiselect';
import { NoteItem, NOTE_TAGS, NoteTag } from '../../../shared/models/note.models';
import { Note } from '../../../shared/components/note/note';
import { Select } from 'primeng/select';
import { NotesService } from '../../notes/notes.service';

@Component({
  selector: 'app-day',
  imports: [
    NgClass,
    Button,
    FormsModule,
    QuillModule,
    MultiSelect,
    Note,
    Select
  ],
  templateUrl: './day.html',
  styleUrl: './day.scss',
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchend)': 'onTouchEnd($event)',
  },
})
export class Day {
  utils = inject(Utils);
  private readonly notesService = inject(NotesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  filterByChapter = signal<string | null>(null);

  dayIndex = 0;
  weekIndex = 0;
  plan: IPlan[] | undefined;
  planName: string = '';
  chapter: string | null = null;

  chapters: string[] = [];
  dayLabel: string = '';
  weekLabel: string = '';

  note: string = '';
  noteChapters: string[] = [];
  noteTags: NoteTag[] = [];
  tagOptions = NOTE_TAGS;

  notesForDay = signal<Record<string, NoteItem[]>>({});

  readCount = computed(() => {
    this.utils.readSet();
    return this.chapters.filter(ch => this.utils.isEntireDayRead([ch])).length;
  });
  totalCount = computed(() => this.chapters.length);
  progress = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.readCount() / total) * 100);
  });
  filteredNotesForDay = computed(() => {
    const notes = this.notesForDay();
    const filter = this.filterByChapter();
    if (!filter) {
      return notes;
    }
    const filtered: Record<string, NoteItem[]> = {};
    for (const [chapter, items] of Object.entries(notes)) {
      if (chapter === filter) {
        filtered[chapter] = items;
      }
    }
    return filtered;
  });    

  loading = signal(true);

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(async (params) => {
        this.dayIndex = params['day'];
        this.weekIndex = params['week'];
        this.plan = this.resolvePlan(params['plan']);
        this.planName = params['plan'];
        this.chapter = params['chapter'] ?? null;

        if (this.chapter) {
          this.chapters = [this.chapter];
          this.noteChapters = [this.chapter];
          this.dayLabel = this.chapter;
          this.weekLabel = '';
          await this.fetchNotes().then(() => this.loading.set(false));
          return;
        }

        const week = this.plan[this.weekIndex - 1];
        const day = week.days[this.dayIndex];
        this.chapters = day.chapters;
        this.dayLabel = day.label;
        this.weekLabel = `Săptămâna ${week.week} · ${week.label}`;

        if (this.chapters.length === 1) {
          this.noteChapters = [this.chapters[0]];
        }

        await this.fetchNotes().then(() => this.loading.set(false));
      });
  }

  goBack() {
    globalThis.history.back();
  }

  async saveNote() {
    this.loading.set(true);
    await this.notesService.saveNote(this.noteChapters, this.note, this.noteTags);

    await this.fetchNotes();

    this.note = '';
    this.noteTags = [];
    this.loading.set(false);
  }

  async fetchNotes() {
    const noteItems = await this.notesService.getNoteItemsForChapters(
      this.chapters
    );
    this.notesForDay.set(noteItems ?? {});
  }

  get notesEntries(): [string, NoteItem[]][] {
    return Object.entries(this.filteredNotesForDay());
  }

  deleteNote(note: NoteItem) {
    this.notesForDay.update((notes) => {
      const chapterNotes = notes[note.chapterLabel] || [];
      const newChapterNotes = chapterNotes.filter( 
        (n) => {
          return n.key !== note.key;
        }
      );
      return {
        ...notes,
        [note.chapterLabel]: newChapterNotes,
      };
    });
  }

  dayHasNoNotes() {
    const notes = this.filteredNotesForDay();
    return !notes || Object.values(notes).every((items) => items.length === 0);
  }

  editNote(note: NoteItem) {
    this.notesForDay.update((notes) => {
      const chapterNotes = notes[note.chapterLabel] || [];

      const newChapterNotes = chapterNotes.map((n) => {
        if (n.key === note.key) {
          return note;
        }

        return n;
      });

      return {
        ...notes,
        [note.chapterLabel]: newChapterNotes,
      };
    });
  }

  // --- Swipe gesture navigation ---
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 80;

  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent) {
    if (this.chapter) return; // Don't swipe on single-chapter views

    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;

    // Only register horizontal swipes (not vertical scrolling)
    if (Math.abs(deltaX) < this.SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;

    if (!this.plan) return;

    const week = this.plan[this.weekIndex - 1];
    if (!week) return;

    if (deltaX < 0) {
      // Swipe left -> next day
      const nextDay = Number(this.dayIndex) + 1;
      if (nextDay < week.days.length) {
        this.router.navigate(['/day'], {
          queryParams: { day: nextDay, week: this.weekIndex, plan: this.planName },
        });
      }
    } else {
      // Swipe right -> previous day
      const prevDay = Number(this.dayIndex) - 1;
      if (prevDay >= 0) {
        this.router.navigate(['/day'], {
          queryParams: { day: prevDay, week: this.weekIndex, plan: this.planName },
        });
      }
    }
  }

  private resolvePlan(planName: string): IPlan[] {
    if (planName === TABS.CRONOLOGIC) return CRONOLOGIC;
    if (planName === TABS.PERSONALIZAT) return this.utils.customPlan();
    return INORDINE;
  }
}
