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
  { id: 'noapte',    label: 'Noapte',     bg: '#1C1C2E', card: '#252540', accent: '#e07b5a' },
  { id: 'ocean',     label: 'Ocean',      bg: '#EBF4F8', card: '#D6EAF2', accent: '#2471A3' },
  { id: 'padure',    label: 'Pădure',     bg: '#EEF4EC', card: '#DCE9D8', accent: '#27AE60' },
  { id: 'lavanda',   label: 'Lavandă',    bg: '#F4EEF9', card: '#E8D8F2', accent: '#8E44AD' },
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
    this.selectedPaletteId.set(id);
  }

  private loadSaved(): string {
    if (typeof localStorage === 'undefined') return 'pergament';
    return localStorage.getItem(STORAGE_KEY) ?? 'pergament';
  }
}
