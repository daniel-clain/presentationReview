import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'idToDate',
  pure: false
})
export class IdToDatePipe implements PipeTransform {

  constructor() { }

  transform(id: number): any {
    return moment(id).format('LLLL');
  }

}
