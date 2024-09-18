import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment-timezone";

@Pipe({
  name: "convertLocalDateTime",
})
export class ConvertLocalDateTimePipe implements PipeTransform {
  transform(value: string, format?: string): string | undefined {
    if (!value) return undefined;
    let dateTime: string;
    const timezone = moment.tz.guess();
    dateTime = moment(value)
      .utc(true)
      .tz(timezone)
      .format(format ? format : "YYYY/MM/DD HH:mm:ss");

    return dateTime;
  }
}
