import { Component, OnInit, Input } from '@angular/core';
import { ReviewsService } from '../services/reviews.service';
import { Presentation, Speaker, ViewObject, CanBeNavigatedTo, ReviewItemRating } from '../miscellaneous/type-definitions';
import { ViewService } from '../services/view.service';

@Component({
  selector: 'app-presentation-history',
  templateUrl: './presentation-history.component.html',
  styleUrls: ['./presentation-history.component.scss']
})
export class PresentationHistoryComponent implements OnInit, CanBeNavigatedTo {
  userPresentations: Presentation[];
  presentationTotalStars = {};
  previousView = '';

  constructor(
    private reviewService: ReviewsService,
    private viewService: ViewService) { }

  ngOnInit(): void {
    this.viewService.navigateToPage().subscribe(
      (viewObj: ViewObject) => {
        if (viewObj.name === 'presentation-history'){
          this.navigatedTo(viewObj);
        }
      }
    );
  }


  navigatedTo(viewObj: ViewObject){
    window.scrollTo(0, 0);
    this.userPresentations = this.reviewService.getUserPresentations();
    this.setOverallRating();
    this.previousView = viewObj.params.previousView;
  }

  presentationSelected(presentation: Presentation) {
    presentation.speakers.forEach((speaker: Speaker) => {
      if (this.reviewService.checkIfUserMatchesSpeaker(speaker)) {
        const viewObj: ViewObject = {
          name: 'review-report',
          params: {
            speakerId: speaker.id,
            presentationId: presentation.id,
            view: 'review-report',
            previousView: 'presentation-history'
          }
        };
        this.viewService.setView(viewObj);
      }
    });
  }
  setOverallRating() {
    this.userPresentations.forEach(presentation => presentation.speakers.forEach((speaker: Speaker) => {
      if (this.reviewService.checkIfUserMatchesSpeaker(speaker)) {
        let totalStars = 0;
        const report = this.reviewService.generateReport(speaker);
        report.forEach((reportItem: ReviewItemRating) => {
          totalStars = totalStars + reportItem.rating;
        });
        this.presentationTotalStars[presentation.id] = totalStars / report.length;
      }
    }));

  }

}
