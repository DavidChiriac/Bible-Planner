import { inject, Injectable, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  readSet = signal(new Set<string>());
  loading = signal(true);

  private readonly firebase = inject(FirebaseService);

  constructor() {
      this.firebase.getChapters().pipe(take(1)).subscribe((chapters) => {
        this.readSet.set(new Set(chapters ?? []));
        this.loading.set(false);
    });
  }

  toggleChapter(chapter: string) {
    if (this.readSet().has(chapter)) {
      this.firebase.deleteChapters([chapter]);
      const newSet = new Set(this.readSet());
      newSet.delete(chapter);
      this.readSet.set(newSet);
    } else {
      this.firebase.addChapters([chapter]);
      const newSet = new Set(this.readSet());
      newSet.add(chapter);
      this.readSet.set(newSet);
    }
  }

  isSelected = (chapter: string) => this.readSet().has(chapter);

  isEntireDayRead = (dayChapters: string[]) => dayChapters.every(chapter => this.readSet().has(chapter));

  setEntireDayRead(chapters: string[]) {
    const value = !this.isEntireDayRead(chapters);
    if (value) {
      this.firebase.addChapters(chapters);
      this.readSet.set(new Set([...this.readSet(), ...chapters]));
    } else {
      this.firebase.deleteChapters(chapters);
      this.readSet.set(new Set([...this.readSet()].filter(c => !chapters.includes(c))));
    }
  }
}
