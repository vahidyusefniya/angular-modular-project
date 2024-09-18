import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, ITag, TagService } from "@app/core/services";
import { DateTimeRange } from "@app/modules/sales-manager/dto/sales-manager.dto";
import { ReportSummary, ReportsClient } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import {
  AggregateReportFilterDto,
  IAggregateReportFilterDto,
} from "../../dto/aggregate-report.dto";
import { AggregateReportService } from "../../service/aggregate-report.service";

@Component({
  selector: "app-aggregate-report",
  templateUrl: "./aggregate-report.component.html",
  styleUrls: ["./aggregate-report.component.scss"],
})
export class AggregateReportComponent implements OnInit {
  dictionary = dictionary;
  branchId!: number;
  aggregateReportList: any[] = [];
  getAggregateReportSub$ = new Subscription();
  loading = false;
  customLabel!: string
  dateTimeCmbData = [
    {
      name: dictionary.Today,
    },
    {
      name: dictionary.CurrentMonth,
    },
    {
      name: dictionary.Custom,
    },
  ];
  dateTime: DateTimeRange | undefined;
  openAggregateReportFilterModal = false;
  aggregateReportFilter = new AggregateReportFilterDto();
  tagList: ITag[] = [];
  changeTagList$ = new Subscription();
  cols: ICol[] = [
    {
      field: "currencyName",
      header: dictionary.Currency,
      hasLinkRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
    {
      field: "count",
      header: dictionary.Count,
      hasNormalRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
    {
      field: "saleAmount",
      header: dictionary.TotalAmount,
      hasNormalRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
  ];

  constructor(
    private reportsClient: ReportsClient,
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private aggregateReportService: AggregateReportService
  ) {
    this.branchId = this.coreService.getBranchId()!;

    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
  }

  ngOnInit() {
    this.initPage();
  }

  initPage() {
    const params = this.getUrlParams();
    if (params) {
      this.aggregateReportFilter.init(params);
    }

    this.getAggregateReport(
      this.aggregateReportFilter.from,
      this.aggregateReportFilter.end
    );
    this.dateTime = dictionary.CurrentMonth;
  }
  getAggregateReport(from?: any, end?: any): void {
    let tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    let fromDate = from || this.getFirstDayOfMonth();
    let endDate = end || tomorrow;
    this.aggregateReportFilter.init({
      from: this.aggregateReportService.getUtcDateTimeForFilterDatePicker(
        fromDate
      ),
      end: this.aggregateReportService.getUtcDateTimeForFilterDatePicker(
        endDate
      ),
    });
    this.updateRouteParameters(this.aggregateReportFilter);
    this.createTags(this.aggregateReportFilter);
    this.loading = true;
    this.getAggregateReportSub$ = this.reportsClient
      .reportSummary(this.branchId, new Date(fromDate), new Date(endDate))
      .subscribe({
        next: (res: ReportSummary[]) => {
          this.aggregateReportList = res.map((item) => ({
            count: item.count.toLocaleString(),
            saleAmount: item.saleAmount.toLocaleString(),
            currencyId: item.currency.currencyId,
            currencyName: item.currency.currencyName,
          }));
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  getFirstDayOfMonth(): Date {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return new Date(currentYear, currentMonth - 1, 1);
  }

  saveAggregateReportFilter(data: AggregateReportFilterDto): void {
    this.aggregateReportFilter.init(data);
    this.createTags(this.aggregateReportFilter);
    this.updateRouteParameters(this.aggregateReportFilter);
    this.getAggregateReport(data.from, data.end);
  }

  updateRouteParameters(filter: AggregateReportFilterDto) {
    const params: Params = {
      beginTime: filter.from,
      endTime: filter.end,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  createTags(data: IAggregateReportFilterDto): void {
    let { from, end } = this.aggregateReportService.generateVisibleDate(data);
    let tags: ITag[];
    const endTime: ITag = {
      key: dictionary.EndTime,
      value: end,
      clearable: false,
    };
    const beginTime: ITag = {
      key: dictionary.BeginTime,
      value: from,
      clearable: false,
    };
    tags = [beginTime, endTime];
    this.tagService.createTags(tags);
  }

  getUrlParams(): IAggregateReportFilterDto | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;

    return {
      from: beginTime,
      end: endTime,
    };
  }

  dateTimeSelectionChange() {
    if (this.dateTime === dictionary.Custom) {
      this.openAggregateReportFilterModal = true;
    } else if (this.dateTime === dictionary.CurrentMonth) {
      let tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
      let fromDate = this.getFirstDayOfMonth();
      let endDate = tomorrow;
      this.customLabel = '';
      this.getAggregateReport(fromDate, endDate);
    } else if (this.dateTime === dictionary.Today) {
      this.aggregateReportFilter.init({
        end: this.aggregateReportService.getTodayDateRange().end,
        from: this.aggregateReportService.getTodayDateRange().from,
      });
      this.getAggregateReport(this.aggregateReportFilter.from, this.aggregateReportFilter.end);
    }
  }


  dismissModal(event: any) {
    this.openAggregateReportFilterModal = event.value;
    if (this.isObjectEmpty(event.data)) {
      this.dateTime = dictionary.CurrentMonth
    } else {
      this.dateTime = '';
      let { from, end } = this.generateVisibleDate(event.data)
      this.customLabel = from + ' - ' + end;
    }
  }

  generateVisibleDate(data: IAggregateReportFilterDto) {
    let fromDate = new Date(data.from!);
    let endDate = new Date(data.end!);
    return {
      from: `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`,
      end: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`
    }
  }

  isObjectEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null) {
        return false;
      }
    }
    return true;
  }

  onCurrencyClick(data: any): void {
    this.router.navigate([`/branches/${this.branchId}/dashboard`], {
      queryParams: {
        from: this.aggregateReportFilter.from,
        end: this.aggregateReportFilter.end,
        currencyId: data.data.currencyId
      }
    });
  }

  onExcelExportClick(){
    this.coreService.exportExcel(this.aggregateReportList, "aggregateReportList");
  }

  onRefreshClick(): void {
    this.getAggregateReport();
  }
}
