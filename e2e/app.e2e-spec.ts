import { PresentationReviewPage } from './app.po';

describe('presentation-review App', () => {
  let page: PresentationReviewPage;

  beforeEach(() => {
    page = new PresentationReviewPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
