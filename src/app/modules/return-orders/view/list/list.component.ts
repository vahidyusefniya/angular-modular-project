import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CoreService, ITag, TagService } from '@app/core/services';
import { ICol } from '@app/shared/components/page-list/page-list.model';
import { dictionary } from '@dictionary/dictionary';
import { Subscription } from 'rxjs';
import { IReturnOrderFilterDto, ReturnOrderFilterDto } from '../../dto/return-order.dto';
import { LayoutService } from '@app/layout';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  dictionary = dictionary;
  loading: boolean = false;
  openReturnOrderFilter: boolean = false;
  cols: ICol[] = [
    {
      field: "Buy order Id",
      header: dictionary.BuyOrderId,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "item",
      header: dictionary.Item,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "quantity",
      header: dictionary.Quantity,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "TotalBuyPrice",
      header: dictionary.TotalBuyPrice,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "CreatedTime",
      header: dictionary.CreatedTime,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "state",
      header: dictionary.State,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      width: "auto",
      field: "approve",
      header: dictionary.Empty,
      hidden: false,
    },
    {
      width: "auto",
      field: "reject",
      header: dictionary.Empty,
      hidden: false,
    },
  ];
  page = 1;
  pageSize = 10;
  branchId!: number;
  tagList: ITag[] = [];
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();
  returnOrders: any[] = [];
  openReturnOrderModal: boolean = false;
  searchOrderId: string = "";
  orderIds: any[] = [];
  allOrderIds: any[] = [];
  returnOrderFilter = new ReturnOrderFilterDto();

  constructor(
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private layoutService: LayoutService
  ) {
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = this.tagService.removeTag$.subscribe((key: string) => {
      if (key === dictionary.EndTime) this.returnOrderFilter.end = undefined;
      if (key === dictionary.BeginTime) this.returnOrderFilter.from = undefined;
      this.updateRouteParameters(this.returnOrderFilter);
    });
    this.branchId = coreService.getBranchId()!;
    this.layoutService.checkPagePermission("SaleReturnOrder");
  }

  ngOnInit() {
    this.initPage();
  }


  initPage() {
    const params = this.getUrlParams();
    // this.loading = true;
    if (params && !this.isObjectEmpty(params)) {
      this.returnOrderFilter.init(params);
      this.updateRouteParameters(this.returnOrderFilter);
      // this.getReturnOrder(this.returnOrderFilter.from, this.returnOrderFilter.end);
      this.createTags({ end: this.returnOrderFilter.end!, from: this.returnOrderFilter.from! });
    } else {
      // this.getReturnOrder();
    }
  }

  getReturnOrder() {

  }

  getUrlParams(): IReturnOrderFilterDto | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;

    let tags: IReturnOrderFilterDto;

    tags = {
      from: beginTime,
      end: endTime,
    };

    return tags;
  }

  isObjectEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null) {
        return false;
      }
    }
    return true;
  }

  onRefreshClick() {

  }
  onExcelExportClick() {

  }

  searchOrderIdList(page: number, query: any) {
    this.page = page;
    if (query.trim().length > 0) {
      this.searchOrderId = query;
      this.orderIds = [...this.allOrderIds]
        .filter((x) =>
          x.merchantName
            .toLocaleLowerCase()
            .includes(this.searchOrderId.toLocaleLowerCase())
        )
        .slice((page - 1) * this.pageSize, page * this.pageSize);
    } else {
      this.searchOrderId = "";
      this.orderIds = [...this.allOrderIds].slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
    }
  }

  onFilterClick(): void {
    this.openReturnOrderFilter = true;
  }

  saveReportFilter(data: ReturnOrderFilterDto) {
    this.returnOrderFilter.init(data);
    this.createTags(this.returnOrderFilter)
    this.updateRouteParameters(this.returnOrderFilter);
    // this.getReturnOrder(this.returnOrderFilter.from, this.returnOrderFilter.end);
  }

  updateRouteParameters(filter: ReturnOrderFilterDto) {
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


  generateVisibleDate(data: IReturnOrderFilterDto) {
    let fromDate = new Date(data.from!);
    let endDate = new Date(data.end!);
    return {
      from: `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`,
      end: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`
    }
  }

  createTags(data: IReturnOrderFilterDto): void {
    let { from, end } = this.generateVisibleDate(data);
    let tags: ITag[];
    const endTime: ITag = {
      key: dictionary.EndTime,
      value: end,
      clearable: true,
    };
    const beginTime: ITag = {
      key: dictionary.BeginTime,
      value: from,
      clearable: true,
    };
    tags = [beginTime, endTime];
    this.tagService.createTags(tags);
  }

}
