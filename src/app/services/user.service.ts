import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ViewObject } from '../miscellaneous/type-definitions';

@Injectable()
export class UserService {

  userId: string;
  userEmail: string;
  userName: string;

  emailUpdateSubject: Subject<any> = new Subject();

  constructor() {
    this.userId = localStorage.getItem('userId');
    if (this.userId === null) {
      this.userId = String(new Date().getTime());
      localStorage.setItem('userId', this.userId);
    }
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.userEmail = userEmail;
    }
    if (localStorage.getItem('userName')){
      this.userName = name;
    }
  }

  registerEmail(email: string) {
    // include code to propagate relative changes, eg, map all instances of this user id to also include this email
    localStorage.setItem('userEmail', email);
    this.userEmail = email;
    this.emailUpdateSubject.next();
  }

  userEmailUpdateEvent(): Subject<any>{
    return this.emailUpdateSubject;
  }
  changeUser(){
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');

    this.userEmail = undefined;
    this.userId = String(new Date().getTime());
    localStorage.setItem('userId', this.userId);

    this.emailUpdateSubject.next();
  }
  setName(name: string){
    localStorage.setItem('userName', name);
    this.userName = name;
  }


}
