import { Component, inject } from '@angular/core';
import BOOKS from '../../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { CheckboxModule } from 'primeng/checkbox';
import { Utils } from '../../../shared/services/utils.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Button } from "primeng/button";

@Component({
  selector: 'app-book-chapters',
  imports: [CheckboxModule, FormsModule, NgClass, Button],
  templateUrl: './book-chapters.html',
  styleUrl: './book-chapters.scss',
})
export class BookChapters {
  book = BOOKS.find((b) => b.title.toLocaleLowerCase().replace(/\s/g, '-') === decodeURIComponent(globalThis.location.pathname.split('/').pop()!));

  utils = inject(Utils);

  goBack() {
    globalThis.history.back();
  }
}
