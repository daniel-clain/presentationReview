export class Presentation {
  name: string;
  id: number;
  speakers: Speaker[];
}

export class ReviewItem {
  reviewItemId: number;
  name: string;
  info: string;
}

export class ReviewItemRating{
  reviewItemId: number;
  rating?: number;
}

export class Review {
  reviewItems: ReviewItemRating[];
  reviewerId: string;
  reviewerEmail: string;
}

export class Speaker {
  id: number;
  name: string;
  submittedReviews: Review[];
  claimedUserEmails?: string[];
}

export class WebSocketData {
  event: string;
  data?: any;
}


export class ViewObject {
  name: string;
  params?: any;
}


export interface CanBeNavigatedTo {
  navigatedTo(x: ViewObject);
}
