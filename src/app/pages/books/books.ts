import { Component, computed, inject, signal } from '@angular/core';
import BOOKS from '../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { Router } from '@angular/router';
import { BookCard } from '../../shared/components/book-card/book-card';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Button } from 'primeng/button';
import { NgClass } from '@angular/common';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-books',
  imports: [BookCard, InputTextModule, FormsModule, SelectModule, Button, NgClass],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class Books {
  private readonly router = inject(Router);
  private readonly sessionStorage = inject(SessionStorageService);
  
  searchTerm = signal(this.sessionStorage.retrieve('booksSearchTerm') || '');

  sortOptions = [
    { label: 'Titlu A-Z', value: 'title-asc' },
    { label: 'Titlu Z-A', value: 'title-desc' },
    { label: 'Normal', value: 'normal' },
  ]

  selectedSortOption = signal(this.sessionStorage.retrieve('booksSelectedSortOption') || 'normal');

  testament = signal(this.sessionStorage.retrieve('booksTestament') || 'old');

  items = computed(() => {
    this.sessionStorage.store('booksSearchTerm', this.searchTerm());
    this.sessionStorage.store('booksSelectedSortOption', this.selectedSortOption());
    this.sessionStorage.store('booksTestament', this.testament());

    const filteredBooks = BOOKS.filter((_, index) => {
      if (this.testament() === 'old') {
        return index < 39;
      } else {
        return index >= 39;
      }
    });

    return filteredBooks.filter((book) =>
      book.title.toLocaleLowerCase().includes(this.searchTerm().toLocaleLowerCase()),
    ).sort((a, b) => {
      if (this.selectedSortOption() === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (this.selectedSortOption() === 'title-desc') {
        return b.title.localeCompare(a.title);
      } else {
        return 0;
      }
    });
  });

  navigateToBook(book: string) {
    this.router.navigate([`/books/${book.toLocaleLowerCase().replace(/\s/g, '-')}`]);
  }
}
