import { inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';
import { Database, listVal, objectVal } from '@angular/fire/database';
import { get, ref, set, update } from 'firebase/database';
import { Observable, switchMap, of, map } from 'rxjs';
import { IPlan } from './models/plan.model';

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

  getPlans(): Observable<IPlan[]> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of([]); // not logged in
        const plansRef = ref(this.db, `users/${u.uid}/plans`);
        return listVal<IPlan>(plansRef, { keyField: 'id' });
      }),
    );
  }

  getPlan(id: string): Observable<IPlan | null> {
    return this.user$.pipe(
      switchMap((u) => {
        if (!u) return of(null);
        const planRef = ref(this.db, `users/${u.uid}/plans/${id}`);
        return objectVal<IPlan>(planRef).pipe(
          map((plan) => (plan ? { ...plan, id } : null)),
        );
      }),
    );
  }

  async upsertPlanById(id: string, plan: IPlan) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not logged in');

    const planRef = ref(this.db, `users/${u.uid}/plans/${id}`);
    const snap = await get(planRef);

    if (snap.exists()) {
      await update(planRef, { ...plan, done: plan.progress === 100 });
      return 'updated';
    } else {
      await set(planRef, { ...plan, done: plan.progress === 100 });
      return 'created';
    }
  }
}
