import { Component, computed, inject, input } from '@angular/core';
import { Utils } from '../../services/utils.service';
import { NgClass } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-book-card',
  imports: [NgClass, ProgressBarModule],
  templateUrl: './book-card.html',
  styleUrl: './book-card.scss',
})
export class BookCard {
  book = input<{ title: string; chapters: string[] }>();
  isCompleted = computed(() => {
    return this.book()?.chapters.every((chapter) => {
      return this.utils.readSet().has(chapter);
    }
    );
  });

  progress = computed(() => {
    const readSet = this.utils.readSet();
    const readChaptersOfThisBook = this.book()?.chapters.filter((chapter) => readSet.has(chapter)) || [];
    return (readChaptersOfThisBook.length / this.book()?.chapters.length!) * 100;
  });

  utils = inject(Utils);
}
