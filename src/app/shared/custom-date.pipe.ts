import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const zone = moment.tz.guess(true);
    const date = value.substr(0, value.indexOf('+'));
    return moment
      .utc(date.trimEnd())
      .tz(zone)
      .format('MMMM Do, YYYY');
  }
}
