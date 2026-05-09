import { TestBed } from '@angular/core/testing';
import { NotesService } from './notes.service';
import { Auth } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { get, ref, remove, update, child } from 'firebase/database';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
  user: jest.fn(() => ({ subscribe: jest.fn() })),
}));
jest.mock('@angular/fire/database', () => ({
  Database: jest.fn(),
}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({
  ref: jest.fn().mockReturnValue({}),
  child: jest.fn().mockReturnValue({}),
  get: jest.fn(),
  remove: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
}));

describe('NotesService', () => {
  let service: NotesService;
  let mockAuth: { currentUser: any };

  beforeEach(() => {
    mockAuth = { currentUser: { uid: 'test-uid' } };

    TestBed.configureTestingModule({
      providers: [
        NotesService,
        { provide: Auth, useValue: mockAuth },
        { provide: Database, useValue: {} },
      ],
    });
    service = TestBed.inject(NotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveNote', () => {
    it('throws when not logged in', async () => {
      mockAuth.currentUser = null;
      await expect(service.saveNote(['Geneza 1'], 'test')).rejects.toThrow('Not logged in');
    });

    it('saves a note to firebase', async () => {
      (get as jest.Mock).mockResolvedValue({
        exists: () => false,
        val: () => null,
      });

      const result = await service.saveNote(['Geneza 1'], 'My note', ['insight']);
      expect(result).toBe('note saved');
      expect(update).toHaveBeenCalled();
    });
  });

  describe('deleteNoteByKey', () => {
    it('throws when not logged in', async () => {
      mockAuth.currentUser = null;
      await expect(service.deleteNoteByKey('Geneza 1', '0')).rejects.toThrow('Not logged in');
    });

    it('deletes a note', async () => {
      const result = await service.deleteNoteByKey('Geneza 1', '0');
      expect(result).toBe('note deleted');
      expect(remove).toHaveBeenCalled();
    });
  });

  describe('updateNote', () => {
    it('throws when not logged in', async () => {
      mockAuth.currentUser = null;
      await expect(service.updateNote('Geneza 1', '0', 'new text')).rejects.toThrow('Not logged in');
    });

    it('throws when note not found', async () => {
      (get as jest.Mock).mockResolvedValue({ exists: () => false });
      await expect(service.updateNote('Geneza 1', '0', 'new text')).rejects.toThrow('Note not found');
    });

    it('updates a note', async () => {
      (get as jest.Mock).mockResolvedValue({
        exists: () => true,
        val: () => ({ text: 'old', createdDate: '2024-01-01' }),
      });

      const result = await service.updateNote('Geneza 1', '0', 'updated text', ['insight']);
      expect(result).toBe('note updated');
      expect(update).toHaveBeenCalled();
    });
  });

  describe('getNoteItemsForChapters', () => {
    it('throws when not logged in', async () => {
      mockAuth.currentUser = null;
      await expect(service.getNoteItemsForChapters(['Geneza 1'])).rejects.toThrow('Not logged in');
    });

    it('returns parsed note items', async () => {
      (get as jest.Mock).mockResolvedValue({
        exists: () => true,
        val: () => ({
          'Geneza 1': {
            '0': { text: 'Note 1', createdDate: '2024-01-01T00:00:00Z' },
            '1': { text: 'Note 2', createdDate: '2024-01-02T00:00:00Z', tags: ['insight'] },
          },
        }),
      });

      const result = await service.getNoteItemsForChapters(['Geneza 1']);
      expect(result['Geneza 1']).toHaveLength(2);
      expect(result['Geneza 1'][0].text).toBe('Note 2'); // sorted by date desc
      expect(result['Geneza 1'][0].book).toBe('Geneza');
      expect(result['Geneza 1'][0].chapter).toBe(1);
    });
  });
});
