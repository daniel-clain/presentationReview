import { Component, Input, OnInit } from '@angular/core';
import { Presentation, Speaker, ViewObject } from '../../miscellaneous/type-definitions';
import { UserService } from '../../services/user.service';
import { ReviewsService } from '../../services/reviews.service';
import { ViewService } from '../../services/view.service';

@Component({
  selector: 'app-speaker-row',
  templateUrl: './speaker-row.component.html'
})
export class SpeakerRowComponent implements OnInit {

  @Input() presentation: Presentation;
  @Input() speaker: Speaker;
  claimedBySomeoneElse: Boolean = false;
  claimedByUser: Boolean = false;

  constructor(
    private userService: UserService,
    private viewService: ViewService,
    private reviewService: ReviewsService) {
    userService.emailUpdateSubject.subscribe(() => this.checkIfClaimed());
  }

  ngOnInit() {
    this.checkIfClaimed();
  }

  checkIfClaimed() {
    const emails = this.speaker.claimedUserEmails;
    if (!emails) {
      return false;
    }
    this.claimedBySomeoneElse = false;
    this.claimedByUser = false;
    emails.forEach((email) => {
      if (email === this.userService.userEmail) {
        this.claimedByUser = true;
      } else {
        this.claimedBySomeoneElse = true;
      }
    });
  }

  claimSpeaker(e) {
    e.stopPropagation();
    if (!this.userService.userEmail){
      alert('You must register your email before you can claim a speaker.');
      return;
    }else {
      if (this.userService.userEmail) {
        if (!this.speaker.claimedUserEmails) {
          this.speaker.claimedUserEmails = [];
        }
        this.speaker.claimedUserEmails.push(this.userService.userEmail);

        this.reviewService.updateSpeaker(this.presentation.id, this.speaker).then(
          () => this.claimedByUser = true
        );
      }
    }
  }

  relinquishSpeaker(e) {
    e.stopPropagation();
    if (this.userService.userEmail) {
      const indexOfUserEmail = this.speaker.claimedUserEmails.indexOf(this.userService.userEmail);
      if (indexOfUserEmail  >= 0) {
        this.speaker.claimedUserEmails.splice(indexOfUserEmail, 1);
      }
    }

    this.reviewService.updateSpeaker(this.presentation.id, this.speaker).then(
      () => this.claimedByUser = false
    );
  }

  viewReport(e) {
    e.stopPropagation();
    const viewObj: ViewObject = {
      name: 'review-report',
      params: {
        speakerId: this.speaker.id,
        presentationId: this.presentation.id,
        view: 'review-report',
        previousView: 'dashboard'
      }
    };
    this.viewService.setView(viewObj);
  }
}
