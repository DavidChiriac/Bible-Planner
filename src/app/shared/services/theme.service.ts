import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Palette {
  id: string;
  label: string;
  bg: string;
  card: string;
  accent: string;
}

export const PALETTES: Palette[] = [
  { id: 'pergament', label: 'Pergament',  bg: '#F2E9D8', card: '#E5D7BF', accent: '#A46447' },
];

const STORAGE_KEY = 'bible-planner-palette';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly palettes = PALETTES;
  readonly selectedPaletteId = signal<string>(this.loadSaved());

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    effect(() => {
      const id = this.selectedPaletteId();
      document.documentElement.dataset['palette'] = id;
      localStorage.setItem(STORAGE_KEY, id);
    });
  }

  setPalette(id: string) {
    if (PALETTES.some(palette => palette.id === id)) {
      this.selectedPaletteId.set(id);
    }
  }

  private loadSaved(): string {
    if (typeof localStorage === 'undefined') return 'pergament';
    const saved = localStorage.getItem(STORAGE_KEY);
    return PALETTES.some(palette => palette.id === saved) ? saved! : 'pergament';
  }
}
