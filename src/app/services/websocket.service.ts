import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

import * as io from 'socket.io-client';

@Injectable()
export class WebsocketService {
  socket;
  url = 'localhost:4000';

  subjectList = {
    'serverDataUpdateBroadcast': new Subject(),
    'serverSaveSuccessful': new Subject(),
    'serverSendPresentationsData': new Subject(),
    'serverSendReviewItems':  new Subject(),
  };

  constructor() {
    this.socket = io(this.url);
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
