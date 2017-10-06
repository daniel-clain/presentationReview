import { Component, OnInit} from '@angular/core';
// import { FileUploader } from 'ng2-file-upload';

import { ViewObject, Presentation, Speaker, Review } from '../../miscellaneous/type-definitions';
import { UserService } from '../../services/user.service';
import { ReviewsService } from '../../services/reviews.service';
import { ViewService } from '../../services/view.service';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit{

  registeredEmail: string;
  // uploader: FileUploader = new FileUploader({url: 'http://localhost:4000/upload', queueLimit: 1, isHTML5: true});

  constructor(private reviewService: ReviewsService,
              private viewService: ViewService,
              private userService: UserService){
    this.registeredEmail = this.userService.userEmail;
    this.userService.emailUpdateSubject.subscribe(() => {
      this.registeredEmail = this.userService.userEmail;
    });
  }

  ngOnInit(){
  }

  registerEmail(emailElement: HTMLInputElement){
    const email = emailElement.value;
    emailElement.value = '';
    this.userService.registerEmail(email);
    this.registeredEmail = this.userService.userEmail;

    this.setEmailAgainstAllRelativeInstances().then(
      () => {
        console.log('set email to all relative instances');
      },
      (error) => {
        console.warn('Failed: set email to all relative instances');
        console.log(error);
      }
    );

  }

  updateEmail(emailElement: HTMLInputElement){
    const email = emailElement.value;
    emailElement.value = '';
    const confirmResult = confirm('Are you sure you want to update your email? \nOld: ' + this.registeredEmail + '\nNew: ' + email);
    if (confirmResult){

      this.lookForAllInstancesOfOldEmailAndReplaceWithNew(email).then(
        () => {
          console.log('update email for all relative instances');
          this.userService.registerEmail(email);
          this.registeredEmail = this.userService.userEmail;
        },
        (error) => {
          console.warn('Failed: update email for all relative instances');
          console.log(error);
        }
      );
    }

  }

  changeUser(){
    const confirmResult = confirm('Are you sure you want to change user?');
    if (confirmResult){
      this.userService.changeUser();
    }

  }

  uploadProfileImage(){
    alert('Feature is in development');
    if (!true){
      // const file = this.uploader.queue[0];
      // file.upload();
    }

  }

  setUserName(nameElement: HTMLInputElement){
    const name = nameElement.value;
    nameElement.value = '';
    this.userService.setName(name);
  }

  viewPresentationHistory(){

    const viewObj: ViewObject = {
      name: 'presentation-history',
      params: {
        previousView: 'dashboard'
      }
    };
    this.viewService.setView(viewObj);

  }

  setEmailAgainstAllRelativeInstances(): Promise<Boolean>{
    const presentations: Presentation[] = this.reviewService.presentations;
    presentations.forEach((presentation: Presentation) => {
      presentation.speakers.forEach((speaker: Speaker) => {
        speaker.submittedReviews.forEach((review: Review) => {
          if (review.reviewerId === this.userService.userId){
            review.reviewerEmail = this.registeredEmail;
          }
        });
      });
    });
    return this.reviewService.updateAllPresentations();
  }

  lookForAllInstancesOfOldEmailAndReplaceWithNew(newVal): Promise<Boolean>{
    const presentations: Presentation[] = this.reviewService.presentations;
    presentations.forEach((presentation: Presentation) => {
      presentation.speakers.forEach((speaker: Speaker) => {
        speaker.submittedReviews.forEach((review: Review) => {
          if (review.reviewerEmail === this.userService.userEmail){
            review.reviewerEmail = newVal;
          }
        });
      });
    });
    return this.reviewService.updateAllPresentations();
  }


}
