import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CoreService, ITag, TagService } from '@app/core/services';
import { LayoutService } from '@app/layout';
import { SaleManagerAccountingReport, SaleManagersClient } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { Subscription } from 'rxjs';
import { DateTimeRange, IReportFilterDto, ReportFilterDto } from '../../dto/sales-manager.dto';
import { SalesManagerService } from '../../service/sales-manager.service';

@Component({
  selector: 'app-report-customers',
  templateUrl: './report-customers.component.html',
  styleUrls: ['./report-customers.component.scss'],
})
export class ReportCustomersComponent implements OnInit {
  dictionary = dictionary;
  branchId!: number;
  loading: boolean = false;
  openReportFilter: boolean = false;
  reportFilter = new ReportFilterDto();
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  tagList: ITag[] = [];
  currencyList: any[] = [];
  dateTime: DateTimeRange | undefined;
  customLabel!: string
  dateTimeCmbData = [
    {
      name: dictionary.CurrentMonth,
    },
    {
      name: dictionary.Custom,
    },
  ];

  constructor(
    private saleManagerService: SaleManagersClient,
    private coreService: CoreService,
    private salesService: SalesManagerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private layoutService: LayoutService,

  ) {
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.branchId = coreService.getBranchId()!;
  }

  ngOnInit() {
    this.initPage();
  }

  initPage() {
    const params = this.getUrlParams();
    this.initBreadcrumbs();
    this.loading = true;
    if (params && !this.isObjectEmpty(params)) {
      this.reportFilter.init(params);
      this.updateRouteParameters(this.reportFilter);
      this.getReports(this.reportFilter.from, this.reportFilter.end);
      this.createTags({ end: this.reportFilter.end!, from: this.reportFilter.from! });
    } else {
      this.dateTime = dictionary.CurrentMonth;
      this.getReports();
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


  getReports(from?: any, end?: any) {
    let tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    let fromDate = from || this.getFirstDayOfMonth();
    let endDate = end || tomorrow;
    this.reportFilter.init({
      from: this.salesService.getUtcDateTimeForFilterDatePicker(fromDate),
      end: this.salesService.getUtcDateTimeForFilterDatePicker(endDate)
    });
    this.updateRouteParameters(this.reportFilter);
    this.createTags({
      end: endDate,
      from: fromDate
    });
    this.saleManagerService.getSaleReport(
      this.branchId,
      this.salesService.getSaleManager?.saleManagerId!,
      new Date(fromDate),
      new Date(endDate)
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.groupByCurrency(res)
      },
      error: (err) => {
        this.loading = false;
        throw Error(err.message);
      },
    })
  }

  groupByCurrency(list: SaleManagerAccountingReport[]) {
    const currencyMap = new Map();
    list.forEach((item: SaleManagerAccountingReport) => {
      const { currencyId, currencyName } = item.currency;
      if (currencyMap.has(currencyId)) {
        const existingItem = currencyMap.get(currencyId);
        existingItem.saleAmount += item.saleAmount;
        existingItem.profit += item.profit;
      } else {
        currencyMap.set(currencyId, {
          saleAmount: item.saleAmount,
          profit: item.profit,
          currencyId: currencyId,
          currencyName: currencyName
        });
      }
    });
    this.currencyList = Array.from(currencyMap.values());
  }

  onFilterClick() {
    this.openReportFilter = true;
  }

  saveReportFilter(data: ReportFilterDto) {
    this.reportFilter.init(data);
    this.createTags(this.reportFilter)
    this.updateRouteParameters(this.reportFilter);
    this.getReports(this.reportFilter.from, this.reportFilter.end);
  }

  updateRouteParameters(filter: ReportFilterDto) {
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

  convertedDate(convertedDate: string) {
    return convertedDate ? new Date(convertedDate) : undefined;
  }


  getFirstDayOfMonth(): Date {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return new Date(currentYear, currentMonth - 1, 1);
  }


  getUrlParams(): IReportFilterDto | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;

    let tags: IReportFilterDto;

    tags = {
      from: beginTime,
      end: endTime,
    };

    return tags;
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      `${this.salesService.getSaleManager?.name}`
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/sale-managers`,
        deActive: false,
        label: dictionary.SaleManagers,
      },
      {
        url: `/branches/${this.branchId}/sale-managers/${this.salesService.getSaleManager?.saleManagerId}`,
        deActive: false,
        label: dictionary.Detail,
      },
    ]);
  }

  dateTimeSelectionChange() {
    if (this.dateTime === dictionary.Custom) {
      this.onFilterClick();
    } else if (this.dateTime === dictionary.CurrentMonth) {
      let tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
      let fromDate = this.getFirstDayOfMonth();
      let endDate = tomorrow;
      this.customLabel = '';
      this.getReports(fromDate, endDate);
    }
  }

  dismissModal(event: any) {
    this.openReportFilter = event.value;
    if (this.isObjectEmpty(event.data)) {
      this.dateTime = dictionary.CurrentMonth
    } else {
      this.dateTime = '';
      let { from, end } = this.generateVisibleDate(event.data)
      this.customLabel = from + ' - ' + end;
    }
  }

  generateVisibleDate(data: IReportFilterDto) {
    let fromDate = new Date(data.from!);
    let endDate = new Date(data.end!);
    return {
      from: `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`,
      end: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`
    }
  }

  createTags(data: IReportFilterDto): void {
    let { from, end } = this.generateVisibleDate(data);
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
}
