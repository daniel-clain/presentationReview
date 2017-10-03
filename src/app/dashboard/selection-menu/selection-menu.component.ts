import { Component, OnInit} from '@angular/core';
import { Presentation, Speaker, ViewObject } from '../../miscellaneous/type-definitions';
import { ReviewsService } from '../../services/reviews.service';
import { UserService } from '../../services/user.service';
import { ViewService } from '../../services/view.service';
import * as moment from 'moment';


@Component({
  selector: 'app-selection-menu',
  templateUrl: './selection-menu.component.html'
})
export class SelectionMenuComponent implements OnInit {

  presentationsList: Presentation[];
  registeredEmail: string;

  constructor(
    private reviewService: ReviewsService,
    private viewService: ViewService,
    private userService: UserService) {

    this.reviewService.serverUpdatePresentation().subscribe(
      (data: Presentation[]) => this.presentationsList = data
    );
    this.registeredEmail = this.userService.userEmail;
  }

  ngOnInit() {
    this.getPresentationsList();
  }

  getPresentationsList() {
    this.reviewService.getPresentations().then(
      (data: Presentation[]) => this.presentationsList = data,
      error => console.warn(error)
    );
  }

  addPresentation(name) {
    if (name.value === '') {
      alert('Presentation name required');
      return;
    }
    const newPresentation = <Presentation>{
      name: name.value,
      id: Number(new Date().getTime()),
      speakers: <Speaker[]>[]
    };
    this.reviewService.newPresentation(newPresentation).then(
      (data: Presentation[]) => {
        this.presentationsList = data;
        name.value = '';
      },
      error => console.warn(error)
    );
  }

  addSpeaker(name, presentation: Presentation) {
    if (name.value === '') {
      alert('Speaker name required');
      return;
    }
    const newSpeaker = <Speaker>{
      name: name.value,
      id: Number(new Date().getTime()),
      submittedReviews: []
    };

    this.reviewService.newSpeaker(newSpeaker, presentation.id).then(
      (data: Presentation[]) => {
        this.presentationsList = data;
        name.value = '';
      },
      error => console.warn(error)
    );
  }

  speakerSelected(speakerId, presentationId) {
    const speaker: Speaker = this.reviewService.getSpeaker(this.reviewService.getPresentation(presentationId), speakerId);
    const userIsSpeaker = this.reviewService.checkIfUserMatchesSpeaker(speaker);
    if (!userIsSpeaker) {

      const viewObj: ViewObject = {
        name: 'review-form',
        params: {
          speakerId: speakerId,
          presentationId: presentationId,
          previousView: 'dashboard',
          view: 'review-form'
        }
      };
      this.viewService.setView(viewObj);

      // this.router.navigate(['/review-report', speakerId, presentationId, 'review', 'selection-menu']);
    } else {
      alert('You can not review your own presentation.');
    }
  }

  trackByPresentationId(index, presentation: Presentation) {
    return presentation.id;
  }
  trackBySpeakerId(index, speaker: Speaker) {
    return speaker.id;
  }

}
