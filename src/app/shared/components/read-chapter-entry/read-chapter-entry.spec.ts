import { TestBed } from '@angular/core/testing';
import { ReadChapterEntry } from './read-chapter-entry';
import { I18nService } from '../../services/i18n.service';
import { Utils } from '../../services/utils.service';
import { BIBLE_BOOKS } from '../../services/firebase.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('ReadChapterEntry', () => {
  let component: ReadChapterEntry;
  const recordReadChapters = jest.fn().mockResolvedValue(undefined);
  const utils = {
    isChapterRead: jest.fn().mockReturnValue(false),
    recordReadChapters,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Utils, useValue: utils },
        { provide: I18nService, useValue: { t: (key: string) => key, bookTitle: (book: string) => book } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new ReadChapterEntry());
  });

  it('adds chapter ranges and individual chapters from multiple books', () => {
    component.chapterInput.set('Geneza 1-3, 5, 8-9; Exodul 2; Matei 2');
    component.addEntry();

    expect(component.selectedChapters()).toEqual([
      'Geneza 1', 'Geneza 2', 'Geneza 3', 'Geneza 5', 'Geneza 8', 'Geneza 9', 'Exodul 2', 'Matei 2',
    ]);
  });

  it('expands a range across books in canonical Bible order', () => {
    component.chapterInput.set('Geneza 1 - Apocalipsa 22');
    component.addEntry();

    const allChapters = BIBLE_BOOKS.flatMap(book => book.chapters);
    expect(component.selectedChapters()).toEqual(allChapters);
  });

  it('expands an English cross-book range', () => {
    component.chapterInput.set('Genesis 1 - Revelation 22');
    component.addEntry();
    expect(component.selectedChapters()).toHaveLength(BIBLE_BOOKS.flatMap(book => book.chapters).length);
    expect(component.selectedChapters()[0]).toBe('Geneza 1');
    expect(component.selectedChapters().at(-1)).toBe('Apocalipsa 22');
  });

  it('rejects reversed cross-book ranges', () => {
    component.chapterInput.set('Apocalipsa 22 - Geneza 1');
    component.addEntry();
    expect(component.entries()).toEqual([]);
    expect(component.error()).toBe('readChapterEntry.invalidRange');
  });

  it('rejects invalid chapter ranges without adding chapters', () => {
    component.chapterInput.set('Geneza 1; Exodul 41');
    component.addEntry();
    expect(component.entries()).toEqual([]);
    expect(component.error()).toBe('readChapterEntry.invalidRange');
  });

  it('marks only selected chapters not already read', async () => {
    utils.isChapterRead.mockImplementation((chapter: string) => chapter === 'Geneza 2');
    component.chapterInput.set('Geneza 1-3');
    component.addEntry();
    await component.saveAsRead();
    expect(recordReadChapters).toHaveBeenCalledWith(['Geneza 1', 'Geneza 3']);
    expect(component.entries()).toEqual([]);
  });

  it('keeps the selection and reports failures when saving fails', async () => {
    recordReadChapters.mockRejectedValueOnce(new Error('Save failed'));
    component.chapterInput.set('Geneza 1');
    component.addEntry();
    await component.saveAsRead();
    expect(component.entries()).toHaveLength(1);
    expect(component.error()).toBe('readChapterEntry.saveError');
  });
});
