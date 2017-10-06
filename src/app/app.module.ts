import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule, CollapseModule, ModalModule, RatingModule, AccordionModule } from 'ngx-bootstrap';

import { ReviewsService } from './services/reviews.service';
import { UserService } from './services/user.service';
import { WebsocketService } from './services/websocket.service';
import { ViewService } from './services/view.service';

import { AppComponent } from './app.component';
import { ReviewFormComponent } from './review-form/review-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SelectionMenuComponent } from './dashboard/selection-menu/selection-menu.component';
import { UserManagementComponent } from './dashboard/user-management/user-management.component';

import { SpeechBubbleComponent } from './miscellaneous/speech-bubble/speech-bubble.component';
import { RecentPresentationsPipe } from './miscellaneous/recent-presentations.pipe';
import { SpeakerRowComponent } from './dashboard/selection-menu/speaker-row.component';
import { PresentationHistoryComponent } from './presentation-history/presentation-history.component';
import { BackButtonComponent } from './miscellaneous/back-button.component';
import { IdToDatePipe } from './miscellaneous/id-to-date.pipe';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ReviewFormComponent,
    SelectionMenuComponent,
    UserManagementComponent,
    SpeechBubbleComponent,
    RecentPresentationsPipe,
    SpeakerRowComponent,
    PresentationHistoryComponent,
    BackButtonComponent,
    IdToDatePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    PopoverModule.forRoot(),
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    RatingModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [ReviewsService, UserService, WebsocketService, ViewService],
  bootstrap: [AppComponent]
})
export class AppModule { }
