import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Books } from './books';
import { Utils } from '../../shared/services/utils.service';
import { BookCompletionGrid } from './book-completion-grid/book-completion-grid';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

@Component({ selector: 'app-book-completion-grid', template: '', standalone: true })
class BookCompletionGridStub {}

describe('Books', () => {
  let fixture: ComponentFixture<Books>;
  let isMobile: ReturnType<typeof signal<boolean | null>>;

  beforeEach(async () => {
    isMobile = signal<boolean | null>(false);

    await TestBed.configureTestingModule({
      imports: [Books],
      providers: [{ provide: Utils, useValue: { isMobile } }],
    })
      .overrideComponent(Books, {
        remove: { imports: [BookCompletionGrid] },
        add: { imports: [BookCompletionGridStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Books);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('applies "container" class on desktop', () => {
    isMobile.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.container')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.container-mobile')).toBeFalsy();
  });

  it('applies "container-mobile" class on mobile', () => {
    isMobile.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.container-mobile')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.container')).toBeFalsy();
  });

  it('renders the book-completion-grid child component', () => {
    expect(fixture.debugElement.query(By.css('app-book-completion-grid'))).toBeTruthy();
  });
});
