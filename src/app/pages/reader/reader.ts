import { Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Utils } from '../../shared/services/utils.service';
import { BibleTextService, BibleChapter, TRANSLATIONS, TRANSLATION_LANGUAGES } from '../../shared/services/bible-text.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-reader',
  imports: [NgClass, Button, DecimalPipe, FormsModule],
  templateUrl: './reader.html',
  styleUrl: './reader.scss',
})
export class Reader {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly bibleText = inject(BibleTextService);
  private readonly firebase = inject(FirebaseService);
  utils = inject(Utils);
  i18n = inject(I18nService);

  chapterLabel = signal('');
  chapter = signal<BibleChapter | null>(null);
  loading = signal(true);
  error = signal(false);
  fontSize = signal(1.05);
  planMode = signal(false);

  // Translation picker dialog state
  showTranslationPicker = signal(false);
  searchQuery = signal('');
  selectedLanguage = signal<string | null>(null);
  showLanguages = signal(false);

  translations = TRANSLATIONS;
  languages = TRANSLATION_LANGUAGES;

  filteredTranslations = computed(() => {
    let list = this.translations;
    const lang = this.selectedLanguage();
    if (lang) {
      list = list.filter(t => t.language === lang);
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.language.toLowerCase().includes(q)
      );
    }
    return list;
  });

  currentTranslationLabel = computed(() => {
    const id = this.bibleText.selectedTranslation();
    if (!id) return null;
    return id === 'local-cornilescu' ? 'VDC' : id;
  });

  isRead = computed(() => this.utils.isChapterRead(this.chapterLabel()));

  prevChapter = computed(() => {
    if (this.planMode()) {
      const chapters = this.utils.planChaptersOrdered();
      const idx = chapters.indexOf(this.chapterLabel());
      return idx > 0 ? chapters[idx - 1] : null;
    }
    return this.bibleText.getAdjacentChapter(this.chapterLabel(), 'prev');
  });

  nextChapter = computed(() => {
    if (this.planMode()) {
      const chapters = this.utils.planChaptersOrdered();
      const idx = chapters.indexOf(this.chapterLabel());
      return idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;
    }
    return this.bibleText.getAdjacentChapter(this.chapterLabel(), 'next');
  });

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const ch = params['chapter'];
        this.planMode.set(params['source'] === 'plan');
        if (ch) {
          this.chapterLabel.set(ch);
          if (this.utils.selectedTranslation()) {
            this.loadChapter(ch);
          } else {
            this.loading.set(false);
          }
          globalThis.scrollTo({ top: 0 });
        }
      });

    // When translation arrives from Firebase after the component initialised,
    // load the chapter that was deferred because the translation wasn't ready.
    effect(() => {
      const translation = this.utils.selectedTranslation();
      const ch = this.chapterLabel();
      if (translation && ch) {
        untracked(() => {
          if (!this.chapter() && !this.loading()) {
            this.loadChapter(ch);
          }
        });
      }
    });
  }

  private async loadChapter(label: string) {
    this.loading.set(true);
    this.error.set(false);

    const result = await this.bibleText.getChapter(label);
    if (result) {
      this.chapter.set(result);
    } else {
      this.error.set(true);
    }
    this.loading.set(false);
  }

  async onTranslationChange(translationId: string) {
    this.bibleText.setTranslation(translationId);
    this.utils.selectedTranslation.set(translationId);
    this.showTranslationPicker.set(false);
    this.searchQuery.set('');
    this.selectedLanguage.set(null);
    await this.firebase.setSelectedTranslation(translationId);
    await this.loadChapter(this.chapterLabel());
  }

  openTranslationPicker() {
    this.searchQuery.set('');
    this.selectedLanguage.set(null);
    this.showTranslationPicker.set(true);
  }

  closeTranslationPicker() {
    this.showTranslationPicker.set(false);
    this.searchQuery.set('');
    this.selectedLanguage.set(null);
  }

  selectLanguage(lang: string | null) {
    this.selectedLanguage.set(lang);
  }

  goBack() {
    globalThis.history.back();
  }

  toggleRead() {
    this.utils.toggleChapterRead(this.chapterLabel());
  }

  navigateTo(label: string) {
    const queryParams: Record<string, string> = { chapter: label };
    if (this.planMode()) queryParams['source'] = 'plan';
    this.router.navigate(['/reader'], { queryParams, replaceUrl: true });
    globalThis.scrollTo({ top: 0 });
  }

  goToNotes() {
    this.router.navigate(['/day'], { queryParams: { chapter: this.chapterLabel() } });
  }

  increaseFontSize() {
    this.fontSize.update(s => Math.min(s + 0.1, 1.6));
  }

  decreaseFontSize() {
    this.fontSize.update(s => Math.max(s - 0.1, 0.8));
  }
}
