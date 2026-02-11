import { Component, inject } from '@angular/core';
import BOOKS from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { Router } from '@angular/router';
import { BookCard } from '../../shared/components/book-card/book-card';

@Component({
  selector: 'app-books',
  imports: [BookCard],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class Books {
  items = BOOKS;

  private readonly router = inject(Router);

  navigateToBook(book: string) {
    this.router.navigate([`/books/${book.toLocaleLowerCase().replace(/\s/g, '-')}`]);
  }
}
