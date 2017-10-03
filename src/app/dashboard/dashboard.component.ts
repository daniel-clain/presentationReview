import { Component, Input, OnInit } from '@angular/core';
import { Presentation, Speaker, ViewObject } from '../miscellaneous/type-definitions';
import { UserService } from '../services/user.service';
import { ReviewsService } from '../services/reviews.service';
import { ViewService } from '../services/view.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <app-selection-menu></app-selection-menu>
    <hr>
    <app-user-management></app-user-management>
  `
})
export class DashboardComponent implements OnInit {


  constructor(
    private userService: UserService,
    private viewService: ViewService,
    private reviewService: ReviewsService) {
  }

  ngOnInit() {
  }
}
