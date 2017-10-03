import { Component, Input } from '@angular/core';
import { ViewService } from '../services/view.service';
import { ViewObject } from './type-definitions';

@Component({
  selector: 'app-back-btn',
  template: `<button class="backBtn btn btnColor" type="button" (click)="backButtonClicked()">Back</button>`
})
export class BackButtonComponent {
  @Input() backPage: any;
  @Input() params: any;

  constructor(private viewService: ViewService) {}

  backButtonClicked() {
    const viewObj: ViewObject = {
      name: this.backPage,
      params: this.params
    };
    this.viewService.setView(viewObj);
    // this.router.navigate(['/' + this.backPage]);
  }
}
