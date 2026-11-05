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
    planChaptersOrdered: jest.fn(),
    recordReadChapters,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    utils.isChapterRead.mockReturnValue(false);
    utils.planChaptersOrdered.mockReturnValue(BIBLE_BOOKS.flatMap(book => book.chapters));
    TestBed.configureTestingModule({
      providers: [
        { provide: Utils, useValue: utils },
        { provide: I18nService, useValue: {
          t: (key: string, params?: Record<string, string | number>) => `${key}${params?.['chapters'] ? ': ' + params['chapters'] : ''}`,
          bookTitle: (book: string) => book,
          translateLabel: (label: string) => label,
          formatChapterRanges: I18nService.prototype.formatChapterRanges,
        } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new ReadChapterEntry());
  });

  it('starts collapsed and lets the heading expand and collapse the form without losing entries', async () => {
    const fixture = TestBed.createComponent(ReadChapterEntry);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const details = host.querySelector('details')!;
    const summary = host.querySelector('summary')!;

    expect(details.open).toBe(false);
    summary.click();
    expect(details.open).toBe(true);

    fixture.componentInstance.chapterInput.set('Geneza 1-3');
    fixture.componentInstance.addEntry();
    fixture.componentInstance.chapterInput.set('Exodul 2');
    fixture.detectChanges();
    await fixture.whenStable();

    summary.click();
    expect(details.open).toBe(false);
    summary.click();
    expect(details.open).toBe(true);
    expect(fixture.componentInstance.selectedChapters()).toEqual(['Geneza 1', 'Geneza 2', 'Geneza 3']);
    expect(host.querySelector('input')!.value).toBe('Exodul 2');
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

  it('ignores chapters outside the plan and saves only included chapters', async () => {
    const ignoredChaptersChange = jest.fn();
    component.ignoredChaptersChange.subscribe(ignoredChaptersChange);
    utils.planChaptersOrdered.mockReturnValue(['Geneza 1', 'Geneza 3', 'Matei 2']);
    component.chapterInput.set('Geneza 1-3; Exodul 2; Matei 2');
    component.addEntry();

    expect(component.selectedChapters()).toEqual(['Geneza 1', 'Geneza 2', 'Geneza 3', 'Exodul 2', 'Matei 2']);
    expect(component.ignoredChapters()).toEqual([]);
    await component.saveAsRead();
    expect(recordReadChapters).toHaveBeenCalledWith(['Geneza 1', 'Geneza 3', 'Matei 2']);
    expect(component.ignoredChapters()).toEqual(['Geneza 2', 'Exodul 2']);
    expect(ignoredChaptersChange).toHaveBeenLastCalledWith(['Geneza 2', 'Exodul 2']);
  });

  it('filters a cross-book range against the actual plan chapters when saving', async () => {
    utils.planChaptersOrdered.mockReturnValue(['Geneza 50', 'Exodul 2']);
    component.chapterInput.set('Geneza 50 - Exodul 2');
    component.addEntry();
    expect(component.selectedChapters()).toEqual(['Geneza 50', 'Exodul 1', 'Exodul 2']);
    await component.saveAsRead();
    expect(recordReadChapters).toHaveBeenCalledWith(['Geneza 50', 'Exodul 2']);
    expect(component.ignoredChapters()).toEqual(['Exodul 1']);
  });

  it('allows adding chapters even when all are outside the plan, then skips them on save', async () => {
    utils.planChaptersOrdered.mockReturnValue(['Matei 1']);
    component.chapterInput.set('Geneza 1-3');
    component.addEntry();
    expect(component.entries()).toHaveLength(1);
    expect(component.chapterInput()).toBe('');
    await component.saveAsRead();
    expect(component.entries()).toEqual([]);
    expect(recordReadChapters).not.toHaveBeenCalled();
    expect(component.ignoredChapters()).toEqual(['Geneza 1', 'Geneza 2', 'Geneza 3']);
    expect(component.error()).toBe('');
  });

  it('ignores all chapters when no plan is configured and lists them in a notification', async () => {
    utils.planChaptersOrdered.mockReturnValue([]);
    const fixture = TestBed.createComponent(ReadChapterEntry);
    fixture.componentInstance.chapterInput.set('Geneza 1');
    fixture.componentInstance.addEntry();
    expect(fixture.componentInstance.entries()).toHaveLength(1);
    await fixture.componentInstance.saveAsRead();
    fixture.detectChanges();
    expect(fixture.componentInstance.entries()).toEqual([]);
    expect(fixture.componentInstance.ignoredChapters()).toEqual(['Geneza 1']);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[role="status"]')?.textContent).toContain('readChapterEntry.ignoredDescription');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Geneza 1');
    const closeButton = host.querySelector<HTMLButtonElement>('.p-dialog-close-button');
    expect(closeButton).not.toBeNull();
    closeButton!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ignoredChapters()).toEqual([]);
  });

  it('revalidates the plan before saving', async () => {
    component.chapterInput.set('Geneza 1-3');
    component.addEntry();
    utils.planChaptersOrdered.mockReturnValue(['Geneza 2']);
    await component.saveAsRead();
    expect(recordReadChapters).toHaveBeenCalledWith(['Geneza 2']);
    expect(component.ignoredChapters()).toEqual(['Geneza 1', 'Geneza 3']);
  });

  it('displays ignored chapters as one bullet per book with consecutive ranges', async () => {
    utils.planChaptersOrdered.mockReturnValue([]);
    const fixture = TestBed.createComponent(ReadChapterEntry);
    fixture.componentInstance.chapterInput.set('Geneza 1-3, 5; Exodul 2-4');
    fixture.componentInstance.addEntry();
    await fixture.componentInstance.saveAsRead();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect([...host.querySelectorAll('.ignored-chapters-list li')].map(item => item.textContent?.trim()))
      .toEqual(['Geneza 1-3, 5', 'Exodul 2-4']);
  });

  it('does not persist anything if the plan is removed before saving', async () => {
    component.chapterInput.set('Geneza 1');
    component.addEntry();
    utils.planChaptersOrdered.mockReturnValue([]);
    await component.saveAsRead();
    expect(recordReadChapters).not.toHaveBeenCalled();
    expect(component.entries()).toEqual([]);
    expect(component.ignoredChapters()).toEqual(['Geneza 1']);
    expect(component.error()).toBe('');
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
