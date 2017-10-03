import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { WebSocketData, Presentation, Speaker, ReviewItem, Review, ReviewItemRating } from '../miscellaneous/type-definitions';
import { WebsocketService } from './websocket.service';
import { UserService } from './user.service';

@Injectable()
export class ReviewsService {

  serverDataUpdateBroadcastSubject = new Subject();
  presentations: Presentation[] = [];

  constructor(private websocket: WebsocketService, private userService: UserService) {
    this.websocket.serverDataUpdateBroadcast().subscribe(
      (returnData: Presentation[]) => {
        this.presentations = returnData;
        this.serverDataUpdateBroadcastSubject.next(returnData);
        console.log('reviewService serverUpdatePresentation');
      }
    );
  }


  private resolveWhenSaveSuccessful(resolve, reject) {
    const subscription = this.websocket.serverSaveSuccessful().subscribe(
      (returnData: Presentation[]) => {
        this.presentations = returnData;
        resolve(returnData);
        subscription.unsubscribe();
      },
      error => {
        reject(error);
      }
    );
  }

  newPresentation(presentation: Presentation): Promise<any> {
    return new Promise((resolve, reject) => {
      this.websocket.sendSocketUpdate(<WebSocketData> {
        event: 'addPresentation',
        data: presentation
      });
      this.resolveWhenSaveSuccessful(resolve, reject);
    });
  }

  newSpeaker(speaker: Speaker, presentationId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.websocket.sendSocketUpdate(<WebSocketData> {
        event: 'addSpeakerToPresentation',
        data: {presentationId: presentationId, speaker: speaker}
      });
      this.resolveWhenSaveSuccessful(resolve, reject);
    });
  }

  getReviewItems(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.websocket.sendSocketUpdate({event: 'getReviewItems'});
      const subscription = this.websocket.serverSendReviewItems().subscribe(
        (returnData: ReviewItem[]) => {
          resolve(returnData);
          subscription.unsubscribe();
        },
        error => {
          reject(error);
        }
      );
    });
  }

  getPresentations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.websocket.sendSocketUpdate({event: 'getPresentations'});
      const subscription = this.websocket.serverSendPresentationsData().subscribe(
        (returnData: Presentation[]) => {
          this.presentations = returnData;
          resolve(returnData);
          subscription.unsubscribe();
        },
        error => {
          reject(error);
        }
      );
    });
  }

  getPresentation(id) {
    let returnPresentation: Presentation;
    this.presentations.forEach((presentation) => {
      if (presentation.id === id) {
        returnPresentation = presentation;
      }
    });
    if (returnPresentation) {
      return returnPresentation;
    }else {
      console.log('presentation with id: ' + id + ' not found');
    }
  }

  getSpeaker(presentation: Presentation, speakerId) {
    let returnSpeaker: Speaker;
    presentation.speakers.forEach(speakerItem => {
      if (speakerItem.id === speakerId) {
        returnSpeaker = speakerItem;
      }
    });
    if (returnSpeaker) {
      return returnSpeaker;
    }else {
      console.log('speaker with id: ' + speakerId + ' not found');
    }
  }

  submitReview(presentationId, speakerId, reviewObject): Promise<any> {
    let presentation: Presentation;
    let speaker: Speaker;

    presentation = this.getPresentation(presentationId);
    speaker = this.getSpeaker(presentation, speakerId);
    const submissionIndex: number = this.checkIfUserHasAlreadySubmittedAReview(speaker);
    if (submissionIndex !== undefined) {
      speaker.submittedReviews[submissionIndex] = reviewObject;
    }else {
      speaker.submittedReviews.unshift(reviewObject);
    }

    return this.updateSpeaker(presentationId, speaker);
  }

  updateSpeaker(presentationId, speaker: Speaker): Promise<any> {
    return new Promise((resolve, reject) => {
      this.websocket.sendSocketUpdate({
        event: 'updateSpeaker', data: {
          presentationId: presentationId,
          speaker: speaker
        }
      });
      this.resolveWhenSaveSuccessful(resolve, reject);
    });
  }
  updateAllPresentations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.websocket.sendSocketUpdate({
        event: 'updateAllPresentations', data: {
          entirePresentationsList: this.presentations
        }
      });
      this.resolveWhenSaveSuccessful(resolve, reject);
    });
  }

  generateReport(speaker: Speaker): ReviewItemRating[] {
    // copy first review, then loop through the rest and sum all the values, then divide by the amount of reviews

    let averageReview: ReviewItemRating[] = [];
    const userService = this.userService;
    const dontIncludeReviewsLeftByTheSpeaker = function(submittedReview: Review): Boolean {
      return !(submittedReview.reviewerEmail && userService.userEmail && submittedReview.reviewerEmail === userService.userEmail);
    };
    const loopThroughEachReviewAndTotalTheRatingForEachReviewItem = function(reviews){
      for (let i = 1; i < reviews.length; i++) {
        const submittedReview: Review = reviews[i];
        const reviewItems: ReviewItemRating[] = submittedReview.reviewItems;
        if (dontIncludeReviewsLeftByTheSpeaker(submittedReview)) {
          for (let k = 0; k < reviewItems.length; k++) {
            if (!isNaN(reviewItems[k].rating)) {
              averageReview[k].rating += reviewItems[k].rating;
            }
          }
        }
      }
    };

    const setTheAverageRatingForEachReviewItem = function(reviews) {
      for (const averageReviewItem of averageReview) {
        const reviewItem = averageReviewItem;

        const sumOfRatings = reviewItem.rating;
        const numOfReviews = reviews.length;
        reviewItem.rating = Math.round(sumOfRatings / numOfReviews);
      }
    };
    const num = this.checkIfUserHasAlreadySubmittedAReview(speaker);
    const reviews: Review[] = speaker.submittedReviews.map(x => Object.assign({}, x));
    if (!isNaN(num)){
      reviews.splice(num, 1);
    }
    if (!(reviews.length > 0)){
      return;
    }
    averageReview = reviews[0].reviewItems.map(x => Object.assign({}, x));
    if (reviews.length > 1) {
      loopThroughEachReviewAndTotalTheRatingForEachReviewItem(reviews);
      setTheAverageRatingForEachReviewItem(reviews);
    }
    return averageReview;
  }


  checkIfUserHasAlreadySubmittedAReview(speaker: Speaker): number {
    const reviews: Review[] = speaker.submittedReviews;
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].reviewerId === this.userService.userId || (this.userService.userEmail && this.userService.userEmail && reviews[i].reviewerEmail === this.userService.userEmail)) {
        return i;
      }
    }
    return;
  }

  getUserPresentations(): Presentation[] {

    const presentationList: Presentation[] = [];

    this.presentations.forEach((presentation: Presentation) => {
      presentation.speakers.forEach((speaker: Speaker) => {
        if (this.checkIfUserMatchesSpeaker(speaker)) {
          let add = true;
          presentationList.forEach((pres: Presentation) => {
            if (pres.id === presentation.id) {
              add = false;
            }
          });
          if (add) {
            presentationList.push(presentation);
          }
        }
      });
    });

    return presentationList;
  }

  checkIfUserMatchesSpeaker(speaker: Speaker): Boolean {
    const userEmail = this.userService.userEmail;

    if (speaker.claimedUserEmails && speaker.claimedUserEmails.indexOf(userEmail) >= 0) {
      return true;
    }

  }

}
