import { Component, OnInit, Input } from '@angular/core';
import { ReviewsService } from '../services/reviews.service';
import { ViewService } from '../services/view.service';
import { Presentation, Speaker, Review, ReviewItem, ReviewItemRating, CanBeNavigatedTo, ViewObject } from '../miscellaneous/type-definitions';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html'
})
export class ReviewFormComponent implements OnInit, CanBeNavigatedTo {
  selectedSpeaker: Speaker;
  selectedPresentation: Presentation;
  presentationId: number;
  speakerId: number;
  view: string;
  previousView: string;
  reviewItems: ReviewItem[];
  activeItemRating: ReviewItemRating[];



  constructor(
    private reviewService: ReviewsService,
    private viewService: ViewService,
    private userService: UserService) {
  }

  ngOnInit(): void {
    this.reviewService.getReviewItems().then((serverReviewItems: ReviewItem[]) => {
      this.reviewItems = serverReviewItems;
    });

    this.viewService.navigateToPage().subscribe(
      (viewObj: ViewObject) => {
        if (viewObj.name === 'review-form' || viewObj.name === 'review-report'){
          this.navigatedTo(viewObj);
        }
      }
    );
  }

  navigatedTo(viewObj: ViewObject){
    window.scrollTo(0, 0);
    this.presentationId = viewObj.params.presentationId;
    this.speakerId = viewObj.params.speakerId;
    this.view = viewObj.params.view;
    this.previousView = viewObj.params.previousView;
    this.setReviewItems();
  }

  setReviewItems(){
    this.selectedPresentation = this.reviewService.getPresentation(this.presentationId);
    this.selectedSpeaker = this.reviewService.getSpeaker(this.selectedPresentation, this.speakerId);
    if (this.view === 'review-form'){
      const submissionIndex: number = this.reviewService.checkIfUserHasAlreadySubmittedAReview(this.selectedSpeaker);
      if (submissionIndex !== undefined){
        this.activeItemRating = this.selectedSpeaker.submittedReviews[submissionIndex].reviewItems.map(x => Object.assign({}, x));
        this.activeItemRating.filter((ratingItem: ReviewItemRating) => {
          let found = false;
          this.reviewItems.forEach((reviewItem: ReviewItem) => {
            if (ratingItem.reviewItemId === reviewItem.reviewItemId ){
              found = true;
            }
          });
          if (!found){
            return false;
          }
        });
      }else{

        this.activeItemRating = [];
        this.reviewItems.forEach((item: ReviewItem) => {
          this.activeItemRating.push({reviewItemId: item.reviewItemId});
        });
      }
    }
    if (this.view === 'review-report'){

      this.activeItemRating = this.reviewService.generateReport(this.selectedSpeaker);
    }
  }

  submitReview(modal) {

    let allRatingsSet = true;
    this.activeItemRating.forEach((item: ReviewItemRating) => {
      if (!item.rating){
        allRatingsSet = false;
        return;
      }
    });
    if (!allRatingsSet){
      alert('Please review all items before submitting');
      return;
    }

    const presentationId =  Number(this.selectedPresentation.id);
    const speakerId = Number(this.selectedSpeaker.id);
    const thisReview: Review = new Review();
    thisReview.reviewItems = this.activeItemRating.map(x => Object.assign({}, x));
    thisReview.reviewerId = this.userService.userId;
    thisReview.reviewerEmail = this.userService.userEmail;

    this.reviewService.submitReview(presentationId, speakerId, thisReview).then(
      () => {
        window.scrollTo(0, 0);
        modal.show();
      },
      error => console.log(error)
    );
  }

}
