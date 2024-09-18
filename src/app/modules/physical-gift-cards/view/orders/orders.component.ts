import { HttpParams } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  PaymentOrderState,
  PhysicalCardOrder,
  PhysicalCardsClient,
  PosOrder,
  PosOrderPaymentItem,
  PosOrderState,
  PosOrdersClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, from } from "rxjs";
import {
  IPhysicalCardOrdersTags,
  PhysicalCardOrdersFilterDto,
} from "../../dto/orders.dto";

declare var require: any;
const html2pdf = require("html2pdf.js");

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.scss"],
})
export class OrdersComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  loading: boolean = false;
  branchId: number;
  branch: Branch;
  merchantId: number;
  page = 1;
  pageSize = 10;
  openPhysicalCardOrderFilterModal: boolean = false;
  cols: any[] = [
    {
      field: "physicalCardOrderId",
      header: dictionary.Id,
    },
    {
      field: "createdTime",
      header: dictionary.OrderTime,
    },
    {
      field: "state",
      header: dictionary.State,
    },
  ];
  physicalCardOrders: PhysicalCardOrder[] = [];
  physicalCardOrder = new PhysicalCardOrder();
  physicalCardOrderFilter = new PhysicalCardOrdersFilterDto();
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();
  tagList: ITag[] = [];
  openPhysicalCardOrderModal: boolean = false;
  searchCriteria: string | undefined;

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private router: Router,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private physicalCardsClient: PhysicalCardsClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.branch = this.layoutService.getBranch(this.branchId)!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.BeginTime) {
        this.physicalCardOrderFilter.from = undefined;
      }
      if (tagsKey == dictionary.EndTime) {
        this.physicalCardOrderFilter.end = undefined;
      }

      if (tagsKey == dictionary.State) {
        this.physicalCardOrderFilter.physicalCardOrderState = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.physicalCardOrderFilter!);
      this.initPage(this.physicalCardOrderFilter!);
    });

    this.layoutService.checkPagePermission("PhysicalCardOrderRead");
  }

  ngOnInit() {
    this.initPosOrdersFilterFromUrlParams();
    this.initPage(this.physicalCardOrderFilter!);
  }

  initPosOrdersFilterFromUrlParams(): void {
    const params = this.getUrlParams();
    if (params) {
      this.physicalCardOrderFilter.init({
        physicalCardOrderState: params.physicalCardOrderState
          ? params.physicalCardOrderState
          : undefined,
        pageNumber: this.page,
        pageSize: this.pageSize,
        end: params.endTime,
        from: params.beginTime,
      });
    }

    this.updateRouteParameters(this.physicalCardOrderFilter);
  }

  getUrlParams(): IPhysicalCardOrdersTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const physicalCardOrderState = httpParams.get("physicalCardOrderState")!;
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;
    const subMerchantId = httpParams.get("subMerchantId")!;
    
    let tags: IPhysicalCardOrdersTags;
    tags = {
      physicalCardOrderState,
      beginTime,
      endTime,
      subMerchantId
    };

    return tags;
  }

  initPage(filter: PhysicalCardOrdersFilterDto): void {
    this.loading = true;
    this.initPage$ = this.physicalCardsClient
      .getOrders(
        this.branchId,
        this.searchCriteria,
        this.physicalCardOrderFilter.physicalCardOrderState,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        filter.pageNumber,
        filter.pageSize
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.physicalCardOrders = res;
          this.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  onRefreshClick() {
    this.initPage(this.physicalCardOrderFilter!);
  }

  convertState(state: string): { status: string; icon: string } {
    const typeMap: { [key: string]: { status: string; icon: string } } = {
      Shipping: { status: "Shipping", icon: "Inprogress_pos_order" },
      Delivered: { status: "Delivered", icon: "Complete" },
      Created: { status: "Created", icon: "Inprogress_pos_order" },
      Reserved: { status: "Reserved", icon: "Inprogress_pos_order" },
      Failed: { status: "Failed", icon: "Failed" },
    };
    return typeMap[state];
  }

  onExcelExportClick() {
    this.loading = true;
    this.initPage$ = this.physicalCardsClient
      .getOrders(
        this.branchId,
        this.searchCriteria,
        this.physicalCardOrderFilter.physicalCardOrderState,
        this.physicalCardOrderFilter.from ? new Date(this.physicalCardOrderFilter.from) : undefined,
        this.physicalCardOrderFilter.end ? new Date(this.physicalCardOrderFilter.end) : undefined,
        this.physicalCardOrderFilter.pageNumber,
        -1
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          let temp = [];
          temp = res.map((item) => {
            return {
              physicalCardOrderId: item.physicalCardOrderId,
              createdTime: item.createdTime,
              country: item.shipping.address.country,
              state: item.shipping.address.state,
              city: item.shipping.address.city,
              rawAddress: item.shipping.address.rawAddress,
              zipCode: item.shipping.address.zipCode,
              phoneNumber: '+'+item.shipping.phoneNumber.countryCode+item.shipping.phoneNumber.number,
              orderState: item.state,
            };
          });
          
          this.coreService.exportExcel(temp, dictionary.Orders);
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  filterClick(filter: PhysicalCardOrdersFilterDto) {
    this.openPhysicalCardOrderFilterModal = false;
    this.page = 1;
    this.physicalCardOrderFilter.init(filter);
    this.updateRouteParameters(filter);
    this.initPage(this.physicalCardOrderFilter);
  }

  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params) this.createTags(params);
  }

  onSearchInput(data: any) {
    this.physicalCardOrders = []
    this.searchCriteria = data;
    this.initPage(this.physicalCardOrderFilter);
  }

  createTags(data: IPhysicalCardOrdersTags): void {
    let tags: ITag[];

    let fromDate = new Date(data.beginTime!);
    let endDate = new Date(data.endTime!);

    const beginTime: ITag = {
      key: dictionary.BeginTime,
      value: data.beginTime
        ? `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${fromDate
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : undefined,
      clearable: true,
    };

    const endTime: ITag = {
      key: dictionary.EndTime,
      value: data.endTime
        ? `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`
        : undefined,
      clearable: true,
    };

    let physicalCardOrderStateValue;
    switch (data.physicalCardOrderState) {
      case "1":
        physicalCardOrderStateValue = dictionary.ReadyForShip;
        break;

      case "2":
        physicalCardOrderStateValue = dictionary.Delivered;
        break;

      case "3":
        physicalCardOrderStateValue = dictionary.Shipping;
        break;

      case "4":
        physicalCardOrderStateValue = dictionary.Failed;
        break;

      default:
        physicalCardOrderStateValue = undefined;
        break;
    }

    const physicalCardOrderState: ITag = {
      key: dictionary.State,
      value:
        data.physicalCardOrderState && !!physicalCardOrderStateValue ? physicalCardOrderStateValue : undefined,
      clearable: true,
    }

    tags = [beginTime, endTime, physicalCardOrderState];
    this.tagService.createTags(tags);
  }

  updateRouteParameters(filter: PhysicalCardOrdersFilterDto) {
    const params: Params = {
      physicalCardOrderState: filter.physicalCardOrderState,
      beginTime: filter.from,
      endTime: filter.end,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  showDetail(data: PhysicalCardOrder) {
    this.physicalCardOrder = data;
    this.openPhysicalCardOrderModal = true;
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.physicalCardOrderFilter.pageNumber = data.page;
    this.initPage(this.physicalCardOrderFilter);
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
