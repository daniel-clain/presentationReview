import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import { environment } from '../../environments/environment';

import * as io from 'socket.io-client';

@Injectable()
export class WebsocketService {
  socket;

  subjectList = {
    'serverDataUpdateBroadcast': new Subject(),
    'serverSaveSuccessful': new Subject(),
    'serverSendPresentationsData': new Subject(),
    'serverSendReviewItems':  new Subject(),
  };

  constructor() {
    const url = (environment.production ? '10.103.2.140' : 'localhost') + ':4000';
    this.socket = io(url);
    this.socket.on('sentFromServer', responseFromServer => this.handleResponseFromServer(responseFromServer));
  }

  handleResponseFromServer(responseFromServer) {
    const event = responseFromServer;
    const eventName = responseFromServer['event'];

    if (event['data']) {
      this.subjectList[eventName].next(event['data']);
    }else {
      this.subjectList[eventName].next();
    }
  }

  serverDataUpdateBroadcast(): Subject<any> {
    return this.subjectList.serverDataUpdateBroadcast;
  }

  serverSaveSuccessful(): Subject<any> {
    return this.subjectList.serverSaveSuccessful;
  }

  serverSendPresentationsData(): Subject<any> {
    return this.subjectList.serverSendPresentationsData;
  }
  serverSendReviewItems(): Subject<any> {
    return this.subjectList.serverSendReviewItems;
  }


  sendSocketUpdate = (sendObj) => {
    this.socket.emit('sentFromApp', sendObj);
  }

}
