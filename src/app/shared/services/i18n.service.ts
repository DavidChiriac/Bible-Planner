import { effect, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';
import { I18N, LANG_LABELS, Lang, BOOK_NAMES_EN_SORTED } from '../i18n/translations';

const STORAGE_KEY = 'bible-planner-lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly languages = Object.entries(LANG_LABELS).map(([id, label]) => ({ id: id as Lang, label }));
  readonly lang = signal<Lang>(this.loadSaved());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(STORAGE_KEY, this.lang());
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.');
    let value: any = I18N[this.lang()];
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== 'string') return key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      value
    );
  }

  tagLabel(value: string): string {
    const map: Record<string, string> = {
      'rugăciune': this.t('tags.rugaciune'),
      'promisiune': this.t('tags.promisiune'),
      'întrebare': this.t('tags.intrebare'),
      'insight': this.t('tags.insight'),
      'important': this.t('tags.important'),
      'profetie': this.t('tags.profetie'),
      'aplicare': this.t('tags.aplicare'),
      'mulțumire': this.t('tags.multumire'),
    };
    return map[value] ?? value;
  }

  /** Translates a single Romanian Bible book title to the active language. */
  bookTitle(ro: string): string {
    if (this.lang() === 'ro' || !ro) return ro;
    return BOOK_NAMES_EN_SORTED.find(([k]) => k === ro)?.[1] ?? ro;
  }

  /**
   * Translates a plan label string (e.g. "Geneza 1-11, Iov 1-20") by
   * replacing Romanian book names with their English equivalents.
   * The chapter numbers and separators are left unchanged.
   * Only runs when the active language is English.
   */
  translateLabel(label: string): string {
    if (this.lang() === 'ro' || !label) return label;
    let result = label;
    for (const [ro, en] of BOOK_NAMES_EN_SORTED) {
      result = result.split(ro).join(en);
    }
    return result;
  }

  private loadSaved(): Lang {
    if (typeof localStorage === 'undefined') return 'ro';
    return (localStorage.getItem(STORAGE_KEY) as Lang) ?? 'ro';
  }
}
