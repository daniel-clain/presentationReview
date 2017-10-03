import { Component, OnInit } from '@angular/core';
import { ViewService } from './services/view.service';
import { UserService } from './services/user.service';
import { ViewObject } from './miscellaneous/type-definitions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {


  registeredEmail: string;
  userName: string;
  currentView: string;

  constructor(private viewService: ViewService, private userService: UserService) {
    this.registeredEmail = this.userService.userEmail;
    this.userName = this.userService.userName;
    this.userService.emailUpdateSubject.subscribe(() => {
      this.registeredEmail = this.userService.userEmail;
    });

    this.userService.userNameUpdateSubject.subscribe(() => {
      this.userName = this.userService.userName;
    });
    this.viewService.navigateToPage().subscribe(
      viewObj => {
        this.currentView = viewObj.name;
      }
    );
  }

  ngOnInit() {
    const viewObj: ViewObject = {
      name: 'dashboard',
      params: null
    };
    this.viewService.setView(viewObj);
  }

}
