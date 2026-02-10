import { Component, inject } from '@angular/core';
import TABS from '../../../../assets/plan_biblie_cronologic_cornilescu_pe_zile_ALL_weeks_labeled.json';
import { AuthService } from '../../shared/services/auth.service';
import { Utils } from '../../shared/services/utils.service';
import { FirebaseService } from '../../shared/services/firebase.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-page',
  imports: [ReactiveFormsModule, FormsModule, AccordionModule, CheckboxModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  tabs = TABS;
  utils = inject(Utils);
  auth = inject(AuthService);
  firebase = inject(FirebaseService);
}
