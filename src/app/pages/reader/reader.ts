import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from 'primeng/button';
import { Utils } from '../../shared/services/utils.service';
import { BibleTextService, BibleChapter } from '../../shared/services/bible-text.service';

@Component({
  selector: 'app-reader',
  imports: [NgClass, Button, DecimalPipe],
  templateUrl: './reader.html',
  styleUrl: './reader.scss',
})
export class Reader {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bibleText = inject(BibleTextService);
  utils = inject(Utils);

  chapterLabel = signal('');
  chapter = signal<BibleChapter | null>(null);
  loading = signal(true);
  error = signal(false);
  fontSize = signal(1.05);

  isRead = computed(() => this.utils.isChapterRead(this.chapterLabel()));
  prevChapter = computed(() => this.bibleText.getAdjacentChapter(this.chapterLabel(), 'prev'));
  nextChapter = computed(() => this.bibleText.getAdjacentChapter(this.chapterLabel(), 'next'));

  constructor() {
    this.route.queryParams
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const ch = params['chapter'];
        if (ch) {
          this.chapterLabel.set(ch);
          this.loadChapter(ch);
        }
      });
  }

  private loadChapter(label: string) {
    this.loading.set(true);
    this.error.set(false);

    const result = this.bibleText.getChapter(label);
    if (result) {
      this.chapter.set(result);
    } else {
      this.error.set(true);
    }
    this.loading.set(false);
  }

  goBack() {
    globalThis.history.back();
  }

  toggleRead() {
    this.utils.toggleChapterRead(this.chapterLabel());
  }

  navigateTo(label: string) {
    this.router.navigate(['/reader'], { queryParams: { chapter: label }, replaceUrl: true });
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
