import { inject, Injectable, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  readChapters = signal<string[]>([]);
  readSet = signal(new Set<string>());
  loading = signal(true);

  private readonly firebase = inject(FirebaseService);

  constructor() {
      this.firebase.getChapters().pipe(take(1)).subscribe((chapters) => {
      this.readChapters.set(chapters ?? []);
      this.readSet.set(new Set(this.readChapters()));
      this.loading.set(false);
    });
  }

  toggleChapter(chapter: string) {
    if (this.readSet().has(chapter)) {
      this.firebase.deleteChapter(chapter);
      const newSet = new Set(this.readSet());
      newSet.delete(chapter);
      this.readSet.set(newSet);
    } else {
      this.firebase.addChapter(chapter);
      const newSet = new Set(this.readSet());
      newSet.add(chapter);
      this.readSet.set(newSet);
    }
  }

  isSelectedFast = (chapter: string) => this.readSet().has(chapter);
}
