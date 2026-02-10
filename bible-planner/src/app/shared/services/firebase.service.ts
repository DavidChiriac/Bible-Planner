import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
  getAuth,
} from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { ref, remove, runTransaction } from 'firebase/database';
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

  getAuth() {
    return getAuth();
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

  async addChapters(newChapters: string[]) {
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

  async deleteChapters(chaptersToDelete: string[]) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
    const toDelete = new Set(chaptersToDelete);

    const result = await runTransaction(chaptersRef, (current) => {
      if (current == null) return current;

      const arr: string[] = Array.isArray(current)
        ? current
        : Object.values(current as Record<string, string>);

      const remaining = arr.filter((ch) => !toDelete.has(ch));

      return remaining.length === 0 ? null : remaining;
    });

    if (!result.committed) return 'nothing to delete';

    return result.snapshot.exists() ? 'deleted' : 'deleted (empty)';
  }

    async resetProgress() {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const chaptersRef = ref(this.db, `users/${u.uid}/chapters`);
    await remove(chaptersRef);
    return 'progress reset';
  }
}
