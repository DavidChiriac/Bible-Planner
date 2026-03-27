import { effect, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';
import { I18N, LANG_LABELS, Lang } from '../i18n/translations';
import { TABS } from '../../pages/home-page/home-page';

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

  tabLabel(tab: TABS): string {
    const map: Record<TABS, string> = {
      [TABS.CRONOLOGIC]: this.t('tabs.cronologic'),
      [TABS.INORDINE]: this.t('tabs.inOrdine'),
      [TABS.PERSONALIZAT]: this.t('tabs.personalizat'),
    };
    return map[tab] ?? tab;
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

  private loadSaved(): Lang {
    if (typeof localStorage === 'undefined') return 'ro';
    return (localStorage.getItem(STORAGE_KEY) as Lang) ?? 'ro';
  }
}
