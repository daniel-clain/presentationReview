import { Pipe, PipeTransform } from '@angular/core';
import { Presentation } from './type-definitions';
import * as moment from 'moment';

@Pipe({
  name: 'recentPresentations',
  pure: false
})
export class RecentPresentationsPipe implements PipeTransform {

  constructor() { }

  transform(presentations: Presentation[]): Presentation[] {
    if (!presentations) {
      return;
    }
    return presentations.filter((presentation: Presentation) => {
      let date = moment();
      let days = 2;
      while (days > 0) {
        date = date.subtract(1, 'days');
        if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
          days -= 1;
        }
      }
      if (moment(presentation.id) > moment(date) ) {
        return presentation;
      }
    });
  }
}
