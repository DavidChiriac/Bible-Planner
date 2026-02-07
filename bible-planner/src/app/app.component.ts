import { Component, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bible-planner';

  private readonly firebase = inject(FirebaseService);

  plans$ = this.firebase.getPlans();

  login() { this.firebase.loginWithGoogle(); }
  logout() { this.firebase.logout(); }
}
