import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressBar } from 'primeng/progressbar';
import { Utils } from '../../shared/services/utils.service';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-home-page',
  imports: [NgClass, RouterLink, ProgressBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  utils = inject(Utils);
  i18n = inject(I18nService);
}
