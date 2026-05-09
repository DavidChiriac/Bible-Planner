import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HomePage } from './home-page';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';
import { RouterTestingModule } from '@angular/router/testing';

jest.mock('@angular/fire/auth', () => ({}));
jest.mock('@angular/fire/database', () => ({}));
jest.mock('@angular/fire/app', () => ({}));

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let isMobile: ReturnType<typeof signal<boolean | null>>;

  beforeEach(async () => {
    isMobile = signal<boolean | null>(false);

    await TestBed.configureTestingModule({
      imports: [HomePage, RouterTestingModule],
      providers: [
        {
          provide: Utils,
          useValue: {
            isMobile,
            readPercentage: () => 42,
            readSet: signal(new Set<string>()),
            customPlan: signal([]),
          },
        },
        { provide: I18nService, useValue: { t: (key: string) => key } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders hero title', () => {
    expect(fixture.nativeElement.textContent).toContain('Bible Agenda');
  });

  it('applies container-mobile on mobile', () => {
    isMobile.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.container-mobile')).toBeTruthy();
  });

  it('applies container on desktop', () => {
    isMobile.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.container')).toBeTruthy();
  });
});
