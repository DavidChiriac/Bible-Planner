import { Component, computed, inject, input } from '@angular/core';
import { Utils } from '../../services/utils.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-book-card',
  imports: [NgClass],
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

  utils = inject(Utils);
}
