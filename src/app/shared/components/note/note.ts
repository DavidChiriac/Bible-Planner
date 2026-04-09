import { Component, inject, input, output, signal } from '@angular/core';
import { NoteItem, NOTE_TAGS, NoteTag } from '../../models/note.models';
import { DatePipe, NgClass } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Utils } from '../../services/utils.service';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { NotesService } from '../../../pages/notes/notes.service';
import { MultiSelect } from 'primeng/multiselect';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-note',
  imports: [DatePipe, Dialog, Button, NgClass, FormsModule, QuillModule, MultiSelect],
  templateUrl: './note.html',
  styleUrl: './note.scss',
})
export class Note {
  private readonly notesService = inject(NotesService);
  utils = inject(Utils);
  i18n = inject(I18nService);
  note = input.required<NoteItem>();
  displayChapterLabel = input(false);

  delete = output<NoteItem>();
  edit = output<NoteItem>();

  noteDeleteConfirmation = signal<{ chapter: string; key: string } | null>(null);
  noteDeleteDialogVisible = signal(false);

  editMode = signal(false);
  editedText = signal('');
  editedTags = signal<NoteTag[]>([]);

  tagOptions = NOTE_TAGS;

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
    this.editedTags.set([...(this.note().tags ?? [])]);
  }

  async confirmEdit() {
    const editedText = this.editedText();
    if (!editedText) return;

    const tags = this.editedTags();
    await this.notesService.updateNote(this.note().chapterLabel, this.note().key, editedText, tags).then(() => {
      this.editMode.set(false);
      this.editedText.set('');
      this.editedTags.set([]);
      this.edit.emit({ ...this.note(), text: editedText, tags });
    });
  }

  getTagColor(tag: NoteTag): string {
    return NOTE_TAGS.find(t => t.value === tag)?.color ?? '#6B5A45';
  }

  getTagLabel(tag: NoteTag): string {
    return this.i18n.tagLabel(tag) ?? NOTE_TAGS.find(t => t.value === tag)?.label ?? tag;
  }

  getTagIcon(tag: NoteTag): string {
    return NOTE_TAGS.find(t => t.value === tag)?.icon ?? 'pi pi-tag';
  }
}
