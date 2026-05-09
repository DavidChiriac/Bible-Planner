import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Footer } from './footer';
import { Utils } from '../../services/utils.service';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let isMobile: ReturnType<typeof signal<boolean | null>>;

  beforeEach(async () => {
    isMobile = signal<boolean | null>(false);

    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [{ provide: Utils, useValue: { isMobile } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays version number', () => {
    expect(fixture.componentInstance.version).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(fixture.componentInstance.version);
  });

  it('displays copyright text', () => {
    expect(fixture.nativeElement.textContent).toContain('Bible Agenda');
  });

  it('applies mobile class on mobile', () => {
    isMobile.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mobile')).toBeTruthy();
  });
});
