import { Component, computed, inject } from '@angular/core';
import { Utils } from '../../../shared/services/utils.service';
import { NgClass } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import BOOKS from '../../../../assets/jsons/biblia_cornilescu_carti_capitole.json';
import { Router } from '@angular/router';
import { getVerseCount } from '../../../shared/services/plan-generator.service';

interface BookProgress {
  title: string;
  total: number;
  read: number;
  percentage: number;
}

@Component({
  selector: 'app-book-completion-grid',
  imports: [NgClass, TooltipModule],
  templateUrl: './book-completion-grid.html',
  styleUrl: './book-completion-grid.scss',
})
export class BookCompletionGrid {
  utils = inject(Utils);
  private readonly router = inject(Router);

  oldTestament = computed<BookProgress[]>(() => this.booksProgress().slice(0, 39));
  newTestament = computed<BookProgress[]>(() => this.booksProgress().slice(39));

  booksProgress = computed<BookProgress[]>(() => {
    const readSet = this.utils.readSet();
    return BOOKS.map(book => {
      const read = book.chapters.filter(ch => readSet.has(ch)).length;
      const total = book.chapters.length;
      return {
        title: book.title,
        total,
        read,
        percentage: total > 0 ? Math.round((read / total) * 100) : 0,
      };
    });
  });

  otProgress = computed(() => {
    const readSet = this.utils.readSet();
    const otBooks = BOOKS.slice(0, 39);
    let totalVerses = 0;
    let readVerses = 0;
    for (const book of otBooks) {
      for (const ch of book.chapters) {
        const v = getVerseCount(ch);
        totalVerses += v;
        if (readSet.has(ch)) readVerses += v;
      }
    }
    return totalVerses > 0 ? Number(((readVerses / totalVerses) * 100).toFixed(2)) : 0;
  });

  ntProgress = computed(() => {
    const readSet = this.utils.readSet();
    const ntBooks = BOOKS.slice(39);
    let totalVerses = 0;
    let readVerses = 0;
    for (const book of ntBooks) {
      for (const ch of book.chapters) {
        const v = getVerseCount(ch);
        totalVerses += v;
        if (readSet.has(ch)) readVerses += v;
      }
    }
    return totalVerses > 0 ? Number(((readVerses / totalVerses) * 100).toFixed(2)) : 0;
  });

  completedBooks = computed(() => this.booksProgress().filter(b => b.percentage === 100).length);
  inProgressBooks = computed(() => this.booksProgress().filter(b => b.percentage > 0 && b.percentage < 100).length);

  getProgressClass(book: BookProgress): string {
    if (book.percentage === 100) return 'complete';
    if (book.percentage >= 75) return 'high';
    if (book.percentage >= 50) return 'medium';
    if (book.percentage > 0) return 'low';
    return 'unread';
  }

  /** Abbreviate long book names for grid */
  abbreviate(title: string): string {
    const map: Record<string, string> = {
      'Geneza': 'Gen',
      'Exodul': 'Exod',
      'Leviticul': 'Lev',
      'Numeri': 'Num',
      'Deuteronomul': 'Deut',
      'Iosua': 'Ios',
      'Judecătorii': 'Jud',
      'Rut': 'Rut',
      '1 Samuel': '1Sam',
      '2 Samuel': '2Sam',
      '1 Împărați': '1Împ',
      '2 Împărați': '2Împ',
      '1 Cronici': '1Cro',
      '2 Cronici': '2Cro',
      'Ezra': 'Ezra',
      'Neemia': 'Neem',
      'Estera': 'Est',
      'Iov': 'Iov',
      'Psalmii': 'Ps',
      'Proverbele': 'Prov',
      'Eclesiastul': 'Ecl',
      'Cântarea Cântărilor': 'Cânt',
      'Isaia': 'Is',
      'Ieremia': 'Ier',
      'Plângerile lui Ieremia': 'Plâng',
      'Ezechiel': 'Ez',
      'Daniel': 'Dan',
      'Osea': 'Os',
      'Ioel': 'Ioel',
      'Amos': 'Amos',
      'Obadia': 'Ob',
      'Iona': 'Iona',
      'Mica': 'Mica',
      'Naum': 'Naum',
      'Habacuc': 'Hab',
      'Țefania': 'Țef',
      'Hagai': 'Hag',
      'Zaharia': 'Zah',
      'Maleahi': 'Mal',
      'Matei': 'Mat',
      'Marcu': 'Marc',
      'Luca': 'Luca',
      'Ioan': 'Ioan',
      'Faptele Apostolilor': 'Fapte',
      'Romani': 'Rom',
      '1 Corinteni': '1Cor',
      '2 Corinteni': '2Cor',
      'Galateni': 'Gal',
      'Efeseni': 'Ef',
      'Filipeni': 'Fil',
      'Coloseni': 'Col',
      '1 Tesaloniceni': '1Tes',
      '2 Tesaloniceni': '2Tes',
      '1 Timotei': '1Tim',
      '2 Timotei': '2Tim',
      'Tit': 'Tit',
      'Filimon': 'Film',
      'Evrei': 'Evr',
      'Iacov': 'Iac',
      '1 Petru': '1Pet',
      '2 Petru': '2Pet',
      '1 Ioan': '1In',
      '2 Ioan': '2In',
      '3 Ioan': '3In',
      'Iuda': 'Iuda',
      'Apocalipsa': 'Apoc',
    };
    return map[title] ?? title.substring(0, 4);
  }

  navigateToBook(title: string) {
    this.router.navigate([`/books/${title.toLocaleLowerCase().replaceAll(/\s/g, '-')}`]);
  }
}
