import { Component, inject, input, output, signal } from '@angular/core';
import { NoteItem } from '../../models/note.models';
import { DatePipe, NgClass } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Utils } from '../../services/utils.service';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { NotesService } from '../../../pages/notes/notes.service';

@Component({
  selector: 'app-note',
  imports: [DatePipe, Dialog, Button, NgClass, FormsModule, Textarea],
  templateUrl: './note.html',
  styleUrl: './note.scss',
})
export class Note {
  private readonly notesService = inject(NotesService);
  utils = inject(Utils);
  note = input.required<NoteItem>();
  displayChapterLabel = input(false);

  delete = output<NoteItem>();
  edit = output<NoteItem>();

  noteDeleteConfirmation = signal<{ chapter: string; key: string } | null>(null);
  noteDeleteDialogVisible = signal(false);

  editMode = signal(false);
  editedText = signal('');

  deleteNote() {
    this.noteDeleteConfirmation.set({ chapter: this.note().chapterLabel, key: this.note().key });
    this.noteDeleteDialogVisible.set(true);
  }

  async confirmDelete() {
    const confirmation = this.noteDeleteConfirmation();
    if (!confirmation) return;

    await this.notesService.deleteNoteByKey(confirmation.chapter, confirmation.key).then(() => {
      this.noteDeleteDialogVisible.set(false);
      this.noteDeleteConfirmation.set(null);
      this.delete.emit(this.note());
    });
  }

  editNote() {
    this.editMode.set(true);
    this.editedText.set(this.note().text);
  }

  async confirmEdit() {
    const editedText = this.editedText();
    if (!editedText) return;

    await this.notesService.updateNote(this.note().chapterLabel, this.note().key, editedText).then(() => {
      this.editMode.set(false);
      this.editedText.set('');
      this.edit.emit({ ...this.note(), text: editedText });
    });
  }
}
