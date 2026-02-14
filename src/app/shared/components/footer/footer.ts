import { Component, inject } from '@angular/core';
import packageJson from '../../../../../package.json';
import { Utils } from '../../services/utils.service';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-footer',
  imports: [NgClass],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  version = packageJson.version;

  utils = inject(Utils);
}
