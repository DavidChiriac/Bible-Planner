import { Component, computed, inject, signal } from '@angular/core';
import BOOKS from '../../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { CheckboxModule } from 'primeng/checkbox';
import { Utils } from '../../../shared/services/utils.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Button } from "primeng/button";
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-book-chapters',
  imports: [CheckboxModule, FormsModule, NgClass, Button, ProgressBar],
  templateUrl: './book-chapters.html',
  styleUrl: './book-chapters.scss',
})
export class BookChapters {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  firebase = inject(FirebaseService);
  utils = inject(Utils);

  id = signal('');

  book = computed(() => {
    return BOOKS.find((b) => {
      return b.title.toLocaleLowerCase().replaceAll(' ', '-') === this.id();
    })
  });

  readCount = computed(() => {
    const chapters = this.book()?.chapters ?? [];
    return chapters.filter(ch => this.utils.readSet().has(ch)).length;
  });

  totalCount = computed(() => this.book()?.chapters?.length ?? 0);

  progress = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.readCount() / total) * 100);
  });

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.id.set(id);
      }
    });
  }

  goBack() {
    globalThis.history.back();
  }

  viewChapterNotes(chapter: string) {
    this.router.navigate(['/day'], { queryParams: { chapter } });
  }
}
