import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Note } from './note';
import { Utils } from '../../services/utils.service';
import { NotesService } from '../../../pages/notes/notes.service';
import { I18nService } from '../../services/i18n.service';
import { Router } from '@angular/router';
import { NoteItem } from '../../models/note.models';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('Note', () => {
  let fixture: ComponentFixture<Note>;
  let mockNotesService: { deleteNoteByKey: jest.Mock; updateNote: jest.Mock };
  let mockRouter: { navigate: jest.Mock };

  const sampleNote: NoteItem = {
    key: '0',
    text: 'Test note text',
    createdDate: '2024-01-01T00:00:00Z',
    book: 'Geneza',
    chapter: 1,
    chapterLabel: 'Geneza 1',
    tags: ['insight'],
  };

  beforeEach(async () => {
    mockNotesService = {
      deleteNoteByKey: jest.fn().mockResolvedValue('deleted'),
      updateNote: jest.fn().mockResolvedValue('updated'),
    };
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [Note],
      providers: [
        { provide: Utils, useValue: { isMobile: signal(false) } },
        { provide: NotesService, useValue: mockNotesService },
        { provide: I18nService, useValue: { tagLabel: (v: string) => v, t: (k: string) => k } },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Note);
    fixture.componentRef.setInput('note', sampleNote);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays note text', () => {
    expect(fixture.nativeElement.textContent).toContain('Test note text');
  });

  it('deleteNote sets confirmation and shows dialog', () => {
    fixture.componentInstance.deleteNote();
    expect(fixture.componentInstance.noteDeleteConfirmation()).toEqual({
      chapter: 'Geneza 1',
      key: '0',
    });
    expect(fixture.componentInstance.noteDeleteDialogVisible()).toBe(true);
  });

  it('confirmDelete calls notesService.deleteNoteByKey', async () => {
    fixture.componentInstance.noteDeleteConfirmation.set({ chapter: 'Geneza 1', key: '0' });
    await fixture.componentInstance.confirmDelete();
    expect(mockNotesService.deleteNoteByKey).toHaveBeenCalledWith('Geneza 1', '0');
  });

  it('editNote enters edit mode', () => {
    fixture.componentInstance.editNote();
    expect(fixture.componentInstance.editMode()).toBe(true);
    expect(fixture.componentInstance.editedText()).toBe('Test note text');
    expect(fixture.componentInstance.editedTags()).toEqual(['insight']);
  });

  it('confirmEdit calls notesService.updateNote', async () => {
    fixture.componentInstance.editNote();
    fixture.componentInstance.editedText.set('Updated text');
    await fixture.componentInstance.confirmEdit();
    expect(mockNotesService.updateNote).toHaveBeenCalledWith('Geneza 1', '0', 'Updated text', ['insight']);
  });

  it('getTagColor returns color for known tag', () => {
    const color = fixture.componentInstance.getTagColor('insight');
    expect(color).toBe('#6B5A45');
  });

  it('getTagColor returns default for unknown tag', () => {
    const color = fixture.componentInstance.getTagColor('unknown' as any);
    expect(color).toBe('#6B5A45');
  });

  it('getTagIcon returns icon for known tag', () => {
    const icon = fixture.componentInstance.getTagIcon('insight');
    expect(icon).toBe('pi pi-lightbulb');
  });

  it('openInReader navigates to reader with chapter', () => {
    fixture.componentInstance.openInReader();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reader'], {
      queryParams: { chapter: 'Geneza 1' },
    });
  });
});
