import { browser, by, element } from 'protractor';

export class PresentationReviewPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
