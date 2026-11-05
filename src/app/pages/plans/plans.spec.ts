import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Plans } from './plans';
import { BIBLE_BOOKS, FirebaseService } from '../../shared/services/firebase.service';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';
import { OT_END_INDEX } from '../../shared/services/plan-generator.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));
jest.mock('firebase/database', () => ({}));
jest.mock('rxfire/database', () => ({}));

describe('Plans history book summary', () => {
  let plans: Plans;
  const savePlanHistory = jest.fn().mockResolvedValue(undefined);
  const config = { books: ['Geneza'], days: 30, excludeCategories: ['genealogies', 'law'] };
  const all = BIBLE_BOOKS.map(book => book.title);
  const old = all.slice(0, OT_END_INDEX);
  const next = all.slice(OT_END_INDEX);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Utils, useValue: {
          loading: () => true,
          customPlanConfig: () => config,
          activeStartDate: () => new Date(2026, 0, 1),
          customPlan: () => [{ days: [{ chapters: ['Geneza 1'] }] }],
          isChapterRead: () => true,
        } },
        { provide: I18nService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: FirebaseService, useValue: { getPlanHistory$: () => of([]), savePlanHistory } },
      ],
    });

    plans = TestBed.runInInjectionContext(() => new Plans());
  });

  it('saves selected chapter exclusions in plan history', async () => {
    await plans.confirmComplete();
    expect(savePlanHistory).toHaveBeenLastCalledWith(expect.objectContaining({
      books: ['Geneza'],
      excludeCategories: ['genealogies', 'law'],
    }));
  });

  it('summarizes the entire Bible without listing books', () => {
    expect(plans.historyBookSummary(all)).toEqual([
      { label: 'home.entireBible', complete: true, except: false, books: [] },
    ]);
  });

  it.each([
    [old, next, 'planBuilder.oldTestament', 'planBuilder.newTestament'],
    [next, old, 'planBuilder.newTestament', 'planBuilder.oldTestament'],
  ])('marks a complete testament and lists a sparse selection from the other', (complete, partial, completeLabel, partialLabel) => {
    const result = plans.historyBookSummary([...complete, ...partial.slice(0, 2)]);
    expect(result).toContainEqual({ label: completeLabel, complete: true, except: false, books: [] });
    expect(result).toContainEqual({ label: partialLabel, complete: false, except: false, books: partial.slice(0, 2) });
  });

  it('lists fewer than ten omissions across both testaments', () => {
    const missing = [old[0], ...next.slice(0, 8)];
    expect(plans.historyBookSummary(all.filter(book => !missing.includes(book)))).toEqual([
      { label: 'home.entireBible', complete: false, except: true, books: missing },
    ]);
  });

  it.each([
    [old, next, 'planBuilder.newTestament'],
    [next, old, 'planBuilder.oldTestament'],
  ])('lists omissions within a nearly complete testament', (complete, partial, label) => {
    expect(plans.historyBookSummary([...complete, ...partial.slice(9)])).toContainEqual({
      label, complete: false, except: true, books: partial.slice(0, 9),
    });
  });

  it('lists included books instead when exactly ten books are missing', () => {
    const missing = [...old.slice(0, 5), ...next.slice(0, 5)];
    const result = plans.historyBookSummary(all.filter(book => !missing.includes(book)));
    expect(result).toHaveLength(2);
    expect(result.every(section => !section.except && !section.complete)).toBe(true);
    expect(result[0].books).toEqual(old.slice(5));
    expect(result[1].books).toEqual(next.slice(5));
  });

  it('omits a testament with no selected books', () => {
    expect(plans.historyBookSummary(old)).toEqual([
      { label: 'planBuilder.oldTestament', complete: true, except: false, books: [] },
    ]);
  });
});

describe('Plans ignored chapter notification', () => {
  it('keeps the notification visible when completing the plan hides chapter entry', () => {
    const completed = signal(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Utils, useValue: {
          loading: () => true,
          customPlanConfig: () => ({ books: ['Geneza'], days: 1 }),
          customPlan: () => [],
          activeStartDate: () => null,
          isMobile: () => false,
          hasCompletedPlan: completed,
          readPercentage: () => completed() ? 100 : 0,
          readSet: () => new Set(),
          favouriteWeeks: () => [],
        } },
        { provide: I18nService, useValue: {
          t: (key: string, params?: Record<string, string | number>) => params?.['chapters'] ?? key,
          translateLabel: (label: string) => label,
          bookTitle: (book: string) => book,
          formatChapterRanges: I18nService.prototype.formatChapterRanges,
        } },
        { provide: FirebaseService, useValue: { getPlanHistory$: () => of([]) } },
      ],
    });
    const fixture = TestBed.createComponent(Plans);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('app-read-chapter-entry')).not.toBeNull();

    fixture.componentInstance.ignoredChapters.set(['Exodul 2']);
    completed.set(true);
    fixture.detectChanges();

    expect(host.querySelector('app-read-chapter-entry')).toBeNull();
    expect(host.querySelector('.ignored-chapters-notice[role="status"]')?.textContent).toContain('Exodul 2');
    const closeButton = host.querySelector<HTMLButtonElement>('.p-dialog-close-button');
    expect(closeButton).not.toBeNull();
    closeButton!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.ignoredChapters()).toEqual([]);
  });
});
