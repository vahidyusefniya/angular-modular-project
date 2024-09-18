import { Injectable } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { AggregateReportFilterDto, IAggregateReportFilterDto } from "../dto/aggregate-report.dto";

@Injectable({
  providedIn: "root",
})
export class AggregateReportService {
  dictionary = dictionary;
  constructor() { }
  generateVisibleDate(data: IAggregateReportFilterDto) {
    let fromDate = new Date(data.from!);
    let endDate = new Date(data.end!);
    return {
      from: `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${fromDate.getDate().toString().padStart(2, "0")}`,
      end: `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`,
    };
  }

  getTodayDateRange(): IAggregateReportFilterDto {
    const range = new AggregateReportFilterDto();
    const day = 1000 * 60 * 60 * 24;
    range.init({
      end: new Date(
        new Date(new Date().getTime() + day).setHours(0, 0, 1, 0)
      ).toString(),
      from: new Date(new Date().setHours(0, 0, 1, 0)).toString(),
    });
    return range;
  }

  getUtcDateTimeForFilterDatePicker(date: string | undefined) {
    if (!date) return dictionary.Empty;
    let midNight = new Date(date).setHours(0, 0, 1, 0);
    return new Date(new Date(midNight).getTime()).toISOString();
  }
}
