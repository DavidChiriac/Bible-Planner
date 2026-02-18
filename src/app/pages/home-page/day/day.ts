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
import { FirebaseService, NoteItem } from '../../../shared/services/firebase.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Dialog } from 'primeng/dialog';

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
    Dialog
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

  chapters: string[] = [];

  note: string = '';
  noteChapters: string[] = [];

  // IMPORTANT: now store items with key+text
  notesForDay = signal<Record<string, NoteItem[]>>({});

  loading = signal(true);

  noteDeleteConfirmation = signal<{ chapter: string; key: string } | null>(null);
  noteDeleteDialogVisible = signal(false);

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe(async (params) => {
        this.dayIndex = params['day'];
        this.weekIndex = params['week'];
        this.plan = params['plan'] === TABS.CRONOLOGIC ? CRONOLOGIC : INORDINE;
        this.chapters =
          this.plan[this.weekIndex - 1].days[this.dayIndex].chapters;

        await this.fetchNotes().then(() => this.loading.set(false));
      });
  }

  goBack() {
    globalThis.history.back();
  }

  async saveNote() {
    this.loading.set(true);
    await this.firebase.saveNote(this.noteChapters, this.note);

    // easiest + consistent: re-fetch so keys stay correct
    await this.fetchNotes();

    this.note = '';
    this.loading.set(false);
  }

  async fetchNotes() {
    const noteItems = await this.firebase.getNoteItemsForChapters(this.chapters);
    this.notesForDay.set(noteItems ?? {});
  }

  get notesEntries(): [string, NoteItem[]][] {
    return Object.entries(this.notesForDay());
  }

  confirmDeleteNote(chapter: string, key: string) {
    this.noteDeleteConfirmation.set({ chapter, key });
    this.noteDeleteDialogVisible.set(true);
  }

  async deleteNote() {
    const confirmation = this.noteDeleteConfirmation();
    if (!confirmation) return;

    const { chapter, key } = confirmation;

    this.loading.set(true);

    await this.firebase.deleteNoteByKey(chapter, key);

    // Update UI locally (no duplicates issues because key is unique)
    this.notesForDay.update((notes) => {
      const items = notes[chapter];
      if (!items) return notes;

      return {
        ...notes,
        [chapter]: items.filter((i) => i.key !== key),
      };
    });

    this.loading.set(false);
    this.noteDeleteDialogVisible.set(false);
    this.noteDeleteConfirmation.set(null);
  }

  dayHasNotHaveNotes() {
    const notes = this.notesForDay();
    return !notes || Object.values(notes).every((items) => items.length === 0);
  }
}
