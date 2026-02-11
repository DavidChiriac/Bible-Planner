import { Component } from '@angular/core';
import packageJson from '../../../../../package.json';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  version = packageJson.version;
}
