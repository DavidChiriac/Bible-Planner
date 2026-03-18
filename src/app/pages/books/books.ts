import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Utils } from '../../shared/services/utils.service';
import { BookCompletionGrid } from './book-completion-grid/book-completion-grid';

@Component({
  selector: 'app-books',
  imports: [NgClass, BookCompletionGrid],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class Books {
  utils = inject(Utils);
}
