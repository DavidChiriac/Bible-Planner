import { TestBed } from '@angular/core/testing';
import { ThemeService, PALETTES } from './theme.service';
import { PLATFORM_ID } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('defaults to "pergament"', () => {
    expect(service.selectedPaletteId()).toBe('pergament');
  });

  it('setPalette changes the selected palette', () => {
    service.setPalette('noapte');
    expect(service.selectedPaletteId()).toBe('noapte');
  });

  it('exposes all palettes', () => {
    expect(service.palettes).toEqual(PALETTES);
    expect(service.palettes.length).toBe(5);
  });

  it('palettes have required properties', () => {
    for (const p of PALETTES) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('label');
      expect(p).toHaveProperty('bg');
      expect(p).toHaveProperty('card');
      expect(p).toHaveProperty('accent');
    }
  });

  it('loads saved palette from localStorage', () => {
    localStorage.setItem('bible-planner-palette', 'ocean');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const freshService = TestBed.inject(ThemeService);
    expect(freshService.selectedPaletteId()).toBe('ocean');
  });
});
