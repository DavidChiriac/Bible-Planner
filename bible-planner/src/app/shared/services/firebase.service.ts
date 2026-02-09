import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { get, ref, remove, runTransaction, set } from 'firebase/database';
import { Observable, switchMap, of } from 'rxjs';
import { listVal } from 'rxfire/database';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly auth = inject(Auth);
  private readonly db = inject(Database);

  readonly user$ = user(this.auth);

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout() {
    await signOut(this.auth);
  }

  getChapters(): Observable<string[]> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of([]);
        const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
        return listVal<string>(chaptersRef);
      }),
    );
  }

  async addChapter(chapter: string) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
    const snap = await get(chaptersRef);

    let chapters: string[] = [];

    if (snap.exists()) {
      chapters = snap.val();

      if (chapters.includes(chapter)) {
        return 'already exists';
      }
    }

    chapters.push(chapter);

    await set(chaptersRef, chapters);
    return 'added';
  }

  async addMultipleChapters(newChapters: string[]) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);

    await runTransaction(chaptersRef, (chapters: string[] | null) => {
      if (!chapters) {
        return [...new Set(newChapters)];
      }

      const merged = new Set<string>([...chapters, ...newChapters]);
      return Array.from(merged);
    });

    return 'added';
  }

  async deleteChapter(chapter: string) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
    const snap = await get(chaptersRef);

    if (!snap.exists()) {
      return 'nothing to delete';
    }

    const chapters: string[] = snap.val();

    const index = chapters.indexOf(chapter);
    if (index === -1) {
      return 'not found';
    }

    chapters.splice(index, 1);

    if (chapters.length === 0) {
      await remove(chaptersRef);
      return 'deleted (empty)';
    }

    await set(chaptersRef, chapters);
    return 'deleted';
  }

  async resetProgress() {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
    await remove(chaptersRef);
    return 'progress reset';
  }
}
