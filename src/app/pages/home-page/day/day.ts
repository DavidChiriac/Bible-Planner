import { Component, inject, signal } from '@angular/core';
import { Utils } from '../../../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TABS } from '../home-page';
import CRONOLOGIC from '../../../../assets/jsons/plan_biblie_cronologic_cornilescu_pe_zile.json';
import INORDINE from '../../../../assets/jsons/plan_biblie_in_ordine_pe_saptamani.json';
import { IPlan } from '../../../shared/models/plan.model';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelect } from 'primeng/multiselect';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NoteItem } from '../../../shared/models/note.models';
import { Note } from '../../../shared/components/note/note';

@Component({
  selector: 'app-day',
  imports: [
    NgClass,
    Button,
    Checkbox,
    FormsModule,
    TextareaModule,
    MultiSelect,
    ProgressSpinnerModule,
    Note,
  ],
  templateUrl: './day.html',
  styleUrl: './day.scss',
})
export class Day {
  utils = inject(Utils);
  private readonly firebase = inject(FirebaseService);
  private readonly route = inject(ActivatedRoute);

  dayIndex = 0;
  weekIndex = 0;
  plan: IPlan[] | undefined;
  chapter: string | null = null;

  chapters: string[] = [];

  note: string = '';
  noteChapters: string[] = [];

  notesForDay = signal<Record<string, NoteItem[]>>({});

  loading = signal(true);

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(async (params) => {
        this.dayIndex = params['day'];
        this.weekIndex = params['week'];
        this.plan = params['plan'] === TABS.CRONOLOGIC ? CRONOLOGIC : INORDINE;
        this.chapter = params['chapter'] ?? null;

        if (this.chapter) {
          this.chapters = [this.chapter];
          this.noteChapters = [this.chapter];
          await this.fetchNotes().then(() => this.loading.set(false));
          return;
        }

        this.chapters =
          this.plan[this.weekIndex - 1].days[this.dayIndex].chapters;

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
    await this.firebase.saveNote(this.noteChapters, this.note);

    await this.fetchNotes();

    this.note = '';
    this.loading.set(false);
  }

  async fetchNotes() {
    const noteItems = await this.firebase.getNoteItemsForChapters(
      this.chapters
    );
    this.notesForDay.set(noteItems ?? {});
  }

  get notesEntries(): [string, NoteItem[]][] {
    return Object.entries(this.notesForDay());
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
    const notes = this.notesForDay();
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
}
