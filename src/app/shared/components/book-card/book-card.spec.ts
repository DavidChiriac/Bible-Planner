import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BookCard } from './book-card';
import { Utils } from '../../services/utils.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('BookCard', () => {
  let fixture: ComponentFixture<BookCard>;
  let readSet: ReturnType<typeof signal<Set<string>>>;
  let isMobile: ReturnType<typeof signal<boolean | null>>;

  const mockBook = {
    title: 'Geneza',
    chapters: ['Geneza 1', 'Geneza 2', 'Geneza 3'],
  };

  beforeEach(async () => {
    readSet = signal(new Set<string>());
    isMobile = signal<boolean | null>(false);

    await TestBed.configureTestingModule({
      imports: [BookCard],
      providers: [{ provide: Utils, useValue: { readSet, isMobile } }],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCard);
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows book title', () => {
    expect(fixture.nativeElement.textContent).toContain('Geneza');
  });

  it('isCompleted is false when no chapters read', () => {
    expect(fixture.componentInstance.isCompleted()).toBe(false);
  });

  it('isCompleted is true when all chapters read', () => {
    readSet.set(new Set(['Geneza 1', 'Geneza 2', 'Geneza 3']));
    fixture.detectChanges();
    expect(fixture.componentInstance.isCompleted()).toBe(true);
  });

  it('progress is 0 when no chapters read', () => {
    expect(fixture.componentInstance.progress()).toBe(0);
  });

  it('progress is ~33 when 1 of 3 chapters read', () => {
    readSet.set(new Set(['Geneza 1']));
    fixture.detectChanges();
    expect(fixture.componentInstance.progress()).toBeCloseTo(33.33, 0);
  });

  it('progress is 100 when all chapters read', () => {
    readSet.set(new Set(['Geneza 1', 'Geneza 2', 'Geneza 3']));
    fixture.detectChanges();
    expect(fixture.componentInstance.progress()).toBe(100);
  });

  it('adds completed class when all chapters read', () => {
    readSet.set(new Set(['Geneza 1', 'Geneza 2', 'Geneza 3']));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.completed')).toBeTruthy();
  });

  it('adds mobile class on mobile', () => {
    isMobile.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mobile')).toBeTruthy();
  });
});
