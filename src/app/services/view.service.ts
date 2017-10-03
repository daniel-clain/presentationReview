import { Injectable } from '@angular/core';
import { WebSocketData, Presentation, Speaker, ReviewItem, Review } from '../miscellaneous/type-definitions';
import { WebsocketService } from './websocket.service';
import { UserService } from './user.service';
import { Subject } from 'rxjs/Subject';
import { ViewObject } from '../miscellaneous/type-definitions';


@Injectable()
export class ViewService {

  navigateSubject: Subject<ViewObject> = new Subject();
  viewOptions = [
    'review-form',
    'presentation-history',
    'review-report',
    'dashboard'
  ];
  constructor() {}

  setView(viewObj: ViewObject) {
    if (this.viewOptions.indexOf(viewObj.name) >= 0) {
      this.navigateSubject.next(viewObj);
    } else {
      console.log('Invalid view: ' + viewObj.name + '. Pick one of the following options \n' + JSON.stringify(this.viewOptions));
    }
  }

  navigateToPage(): Subject<ViewObject>{
    return this.navigateSubject;
  }

}
