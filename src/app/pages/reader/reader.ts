import { Component, inject, signal, computed, effect, untracked, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Utils } from '../../shared/services/utils.service';
import { BibleTextService, BibleChapter, TRANSLATIONS, TRANSLATION_LANGUAGES, getBookNameByNumber, stripHtml } from '../../shared/services/bible-text.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-reader',
  imports: [NgClass, Button, DecimalPipe, FormsModule],
  templateUrl: './reader.html',
  styleUrl: './reader.scss',
})
export class Reader implements AfterViewChecked {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);
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
  openRefs = signal<Set<number>>(new Set());

  // Reference navigation stack
  refPopup = signal<{ label: string; verseNr: number | null; verseText: string | null; loading: boolean } | null>(null);
  refStack = signal<string[]>([]);

  private pendingScrollVerse: number | null = null;

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
        this.refStack.set(params['refStack'] ? JSON.parse(params['refStack']) : []);
        const verse = params['verse'] ? Number(params['verse']) : null;
        if (ch) {
          this.chapterLabel.set(ch);
          if (this.utils.selectedTranslation()) {
            this.loadChapter(ch);
          } else {
            this.loading.set(false);
          }
          if (verse) {
            this.pendingScrollVerse = verse;
          } else {
            globalThis.scrollTo({ top: 0 });
          }
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
    this.openRefs.set(new Set());
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

  toggleRef(verseNum: number) {
    this.openRefs.update(set => {
      const next = new Set(set);
      if (next.has(verseNum)) next.delete(verseNum);
      else next.add(verseNum);
      return next;
    });
  }

  ngAfterViewChecked() {
    if (this.pendingScrollVerse && this.chapter()) {
      const verse = this.pendingScrollVerse;
      this.pendingScrollVerse = null;
      setTimeout(() => {
        const el = this.el.nativeElement.querySelector(`[data-verse="${verse}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('verse-highlight');
          setTimeout(() => el.classList.remove('verse-highlight'), 2000);
        }
      });
    }
  }

  onVersesClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Handle <a> clicks inside verse comments or popup → show preview dialog
    if (target.tagName === 'A' && (target.closest('.verse-comment') || target.closest('.ref-popup'))) {
      event.preventDefault();
      event.stopPropagation();
      this.showRefPreview(target);
      return;
    }

    // Handle sup clicks → toggle the verse comment (same as ref-toggle)
    if (target.tagName === 'SUP' && !target.classList.contains('verse-num')) {
      const verseSpan = target.closest('.verse') as HTMLElement | null;
      if (!verseSpan) return;
      const verseNum = Number(verseSpan.dataset['verse']);
      const verse = this.chapter()?.verses.find(v => v.verse === verseNum);
      if (!verse?.comment) return;
      this.toggleRef(verseNum);
      event.stopPropagation();
    }
  }

  onRefPopupClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      event.preventDefault();
      event.stopPropagation();
      this.showRefPreview(target);
    }
  }

  private showRefPreview(anchor: HTMLElement) {
    const href = anchor.getAttribute('href');
    if (!href) return;

    const match = /^\/[A-Za-z0-9]+\/(\d+)\/(\d+)(?:\/(\d+))?/.exec(href);
    if (!match) return;

    const bookNr = Number(match[1]);
    const chapterNr = Number(match[2]);
    const verseNr = match[3] ? Number(match[3]) : null;

    const bookName = getBookNameByNumber(bookNr);
    if (!bookName) return;

    const label = `${bookName} ${chapterNr}`;
    this.refPopup.set({ label, verseNr, verseText: null, loading: true });

    this.bibleText.getChapter(label).then(chapter => {
      if (!chapter) {
        this.refPopup.set({ label, verseNr, verseText: 'Could not load verse.', loading: false });
        return;
      }
      if (verseNr) {
        const v = chapter.verses.find(v => v.verse === verseNr);
        this.refPopup.set({ label, verseNr, verseText: v ? stripHtml(v.text) : 'Verse not found.', loading: false });
      } else {
        const preview = chapter.verses.slice(0, 3).map(v => `${v.verse}. ${stripHtml(v.text)}`).join(' ');
        this.refPopup.set({ label, verseNr: null, verseText: preview + '…', loading: false });
      }
    });
  }

  goToRef() {
    const popup = this.refPopup();
    if (!popup) return;
    this.refPopup.set(null);

    const queryParams: Record<string, string> = { chapter: popup.label };
    if (popup.verseNr) queryParams['verse'] = String(popup.verseNr);
    const newStack = [...this.refStack(), this.chapterLabel()];
    queryParams['refStack'] = JSON.stringify(newStack);
    if (this.planMode()) queryParams['source'] = 'plan';
    this.openRefs.set(new Set());
    this.router.navigate(['/reader'], { queryParams, replaceUrl: true });
  }

  goBackRef() {
    const stack = this.refStack();
    if (stack.length === 0) return;
    const target = stack.at(-1)!;
    const newStack = stack.slice(0, -1);
    const queryParams: Record<string, string> = { chapter: target };
    if (newStack.length > 0) queryParams['refStack'] = JSON.stringify(newStack);
    if (this.planMode()) queryParams['source'] = 'plan';
    this.openRefs.set(new Set());
    this.router.navigate(['/reader'], { queryParams, replaceUrl: true });
  }

  goToOriginalRef() {
    const stack = this.refStack();
    if (stack.length === 0) return;
    const target = stack[0];
    const queryParams: Record<string, string> = { chapter: target };
    if (this.planMode()) queryParams['source'] = 'plan';
    this.openRefs.set(new Set());
    this.router.navigate(['/reader'], { queryParams, replaceUrl: true });
  }

  closeRefPopup() {
    this.refPopup.set(null);
  }
}