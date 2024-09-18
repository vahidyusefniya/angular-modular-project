import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  NotificationService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  CreateChargeOrdinaryPaymentOrderRequest,
  CurrenciesClient,
  Currency,
  PaymentOrder,
  PaymentOrderState,
  PaymentOrderStateLog,
  PaymentOrderSummary,
  PaymentOrderType,
  PaymentOrdersClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import * as moment from "moment-timezone";
import { Subscription, combineLatest } from "rxjs";
import { IPaymentTags, PaymentFilterDtoDto } from "../../dto/payment.dto";

@Component({
  selector: "app-peyments",
  templateUrl: "./peyments.component.html",
  styleUrls: ["./peyments.component.scss"],
})
export class PeymentsComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  cols = [
    {
      field: "paymentOrderId",
      header: dictionary.Id,
    },
    {
      field: "amount",
      header: dictionary.Amount,
    },
    {
      field: "createdTime",
      header: dictionary.CreatedTime,
    },
    {
      field: "autoPayment",
      header: dictionary.AutoPay,
    },
    {
      field: "type",
      header: dictionary.Type,
    },
    {
      field: "paymentOrderState",
      header: dictionary.State,
    },
  ];
  paymentOrders: PaymentOrderSummary[] = [];
  paymentOrderFilter = new PaymentFilterDtoDto();
  page = 1;
  pageSize = 11;
  merchantId = 0;
  openPaymentOrderDetailModal = false;
  paymentOrder: PaymentOrder | undefined;
  getPaymentOrders$ = new Subscription();
  getPaymentOrder$ = new Subscription();
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  openPaymentModalFilter: boolean = false;
  tagList: ITag[] = [];
  showCreatePaymentModal: boolean = false;
  getCurrencies$ = new Subscription();
  initPaymentOrder$ = new Subscription();
  branchId: number | undefined;
  stateLogs: PaymentOrderStateLog[] = [];
  selectedBranch: Branch | undefined;
  branches: Branch[] = [];

  constructor(
    private loadingService: LoadingService,
    private paymentOrdersClient: PaymentOrdersClient,
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private currenciesClient: CurrenciesClient,
    private layoutService: LayoutService,
    private notificationService: NotificationService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branches = this.layoutService.branches;
    this.merchantId = coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.EndTime) {
        this.paymentOrderFilter.end = undefined;
      }
      if (tagsKey == dictionary.BeginTime) {
        this.paymentOrderFilter.from = undefined;
      }
      if (tagsKey == dictionary.Type) {
        this.paymentOrderFilter.paymentOrderType = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.paymentOrderFilter);
      this.initPaymentOrders(this.paymentOrderFilter);
    });
    this.layoutService.checkPagePermission("PaymentOrderRead");

    this.activatedRoute.queryParams.subscribe((params) => {
      const { paymentOrderId } = params;
      this.paymentOrderFilter.paymentOrderId = paymentOrderId;
    });
  }

  ngOnInit() {
    this.selectedBranch = this.branches.find(
      (b) => b.branchId == this.branchId
    );
    if (!this.selectedBranch?.canCreatePaymentOrder) {
      this.router.navigate([`/branches/${this.branchId}/price-lists`]);
    }
    this.initFilterRequest(this.page, this.pageSize);
    const params = this.getUrlParams();
    if (params) {
      this.paymentOrderFilter.init({
        from: params.beginTime,
        end: params.endTime,
        pageNumber: this.page,
        pageSize: this.pageSize,
        paymentOrderStates: params.paymentOrderStates,
        paymentOrderId: params.paymentOrderId,
        paymentOrderType: params.paymentOrderType
          ? (params.paymentOrderType as PaymentOrderType)
          : undefined,
      });
    }
    if (!this.paymentOrderFilter.paymentOrderId) {
      this.initPaymentOrders(this.paymentOrderFilter);
    } else {
      const searchInputEl = document.getElementsByTagName("ion-input");
      setTimeout(() => {
        searchInputEl[0].value = this.paymentOrderFilter.paymentOrderId;
        this.onInputSearch(this.paymentOrderFilter.paymentOrderId);
      }, 200);
    }
  }

  initPaymentOrders(filter: PaymentFilterDtoDto): void {
    this.loading = true;
    this.getPaymentOrders$ = this.paymentOrdersClient
      .getPaymentOrders(
        this.branchId!,
        filter.paymentOrderStates,
        filter.paymentOrderType,
        this.paymentOrderFilter.paymentOrderId,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        filter.pageNumber,
        filter.pageSize
      )
      .subscribe({
        next: (res: PaymentOrderSummary[]) => {
          this.loading = false;
          this.paymentOrders = res;
          this.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          this.createTagFromUrlParams();
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  onInputSearch(value: any): void {
    this.loading = true;
    this.page = 1;
    this.paymentOrderFilter.pageNumber = 1;
    if (!value) {
      this.paymentOrderFilter.paymentOrderId = undefined;
    } else {
      this.paymentOrderFilter.paymentOrderId = value;
    }
    this.savePaymentFilter(this.paymentOrderFilter);
  }

  createPaymentOrder(data: CreateChargeOrdinaryPaymentOrderRequest) {
    this.loadingService.present();
    this.paymentOrdersClient.ordinary(this.branchId!, data).subscribe({
      next: (response) => {
        this.loadingService.dismiss();
        this.notificationService.showSuccessNotification(
          dictionary.textMessageNotifAfterCreatePayment
        );
        window.location.href = response.paymentUrl!;
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }

  paymentOrderDetailClick(event: Event, data: PaymentOrder): void {
    event.preventDefault();
    this.loadingService.present();
    this.initPaymentOrder$ = combineLatest({
      paymentOrder: this.paymentOrdersClient.get(
        this.branchId!,
        data.paymentOrderId
      ),
      stateLogs: this.paymentOrdersClient.stateLogs(
        this.branchId!,
        data.paymentOrderId
      ),
    }).subscribe({
      next: (res) => {
        this.loadingService.dismiss();
        this.paymentOrder = res.paymentOrder;
        this.stateLogs = res.stateLogs;
        this.openPaymentOrderDetailModal = true;
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }

  generatePaymentOrderStateName(data: PaymentOrder): string {
    if (
      data.paymentOrderState == PaymentOrderState.PaymentProviderCreated ||
      data.paymentOrderState == PaymentOrderState.PaymentProviderCaptured ||
      data.paymentOrderState == PaymentOrderState.PaymentProviderDisputed ||
      data.paymentOrderState == PaymentOrderState.Created
    )
      return dictionary.Pending;
    else return data.paymentOrderState;
  }

  onRefreshClick(): void {
    this.initPaymentOrders(this.paymentOrderFilter);
  }
  async onExcelExportClick(filter: PaymentFilterDtoDto): Promise<void> {
    // this.loading = true;
    this.loadingService.present();
    const timezone = moment.tz.guess();
    this.getPaymentOrders$ = this.paymentOrdersClient
      .getPaymentOrders(
        this.branchId!,
        filter.paymentOrderStates,
        filter.paymentOrderType,
        this.paymentOrderFilter.paymentOrderId,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        -1,
        undefined
      )
      .subscribe({
        next: (res: PaymentOrderSummary[]) => {
          let paymentsOrder = res.map((item) => ({
            paymentOrderId: item.paymentOrderId,
            paymentOrderState: item.paymentOrderState,
            amount: item.amount,
            autoPayment: item.autoPayment,
            createdTime: moment(item.createdTime)
              .utc(true)
              .tz(timezone)
              .format("YYYY/MM/DD HH:mm:ss"),
          }));
          this.coreService.exportExcel(paymentsOrder, "payments order");
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          // this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          // this.loading = false;
        },
      });
  }
  pageChanged(data: IPageChange): void {
    this.paymentOrderFilter.pageNumber = data.page;
    this.paymentOrderFilter.pageSize = data.pageSize;
    this.initPaymentOrders(this.paymentOrderFilter);
  }

  onAdvancedFilterClick(): void {
    this.openPaymentModalFilter = true;
  }

  savePaymentFilter(filter: PaymentFilterDtoDto) {
    this.openPaymentModalFilter = false;
    this.paymentOrderFilter.init(filter);
    this.page = 1;
    this.initFilterRequest(this.page, this.pageSize, filter);
    this.updateRouteParameters(filter);
    this.createTagFromUrlParams();
    this.initPaymentOrders(filter);
  }

  createTagFromUrlParams(): void {
    this.createTags({
      beginTime: this.paymentOrderFilter.from!,
      endTime: this.paymentOrderFilter.end!,
      paymentOrderStates: this.paymentOrderFilter.paymentOrderStates!,
      paymentOrderType: this.paymentOrderFilter.paymentOrderType,
      paymentOrderId: this.paymentOrderFilter.paymentOrderId!,
    });
  }
  getUrlParams(): IPaymentTags | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;
    const paymentOrderStates = httpParams.get("paymentOrderStates")!;
    const paymentOrderType = httpParams.get("paymentOrderType")!;
    const paymentOrderId = httpParams.get("paymentOrderId")!;

    let tags: IPaymentTags;

    tags = {
      beginTime,
      endTime,
      paymentOrderStates,
      paymentOrderType,
      paymentOrderId,
    };

    return tags;
  }

  createTags(data: IPaymentTags): void {
    let tags: ITag[];

    const endTime: ITag = {
      key: dictionary.EndTime,
      value: data.endTime ? data.endTime.toString().split("T")[0] : undefined,
      clearable: true,
    };

    const beginTime: ITag = {
      key: dictionary.BeginTime,
      value: data.beginTime
        ? data.beginTime.toString().split("T")[0]
        : undefined,
      clearable: true,
    };

    const paymentOrderStates: ITag = {
      key: dictionary.State,
      value: data.paymentOrderStates
        ? data.paymentOrderStates.split("T")[0]
        : undefined,
      clearable: true,
    };

    let paymentOrderType;

    switch (data.paymentOrderType) {
      case "ChargeByPosOrder":
        paymentOrderType = dictionary.POS;
        break;

      case "ChargeByPostPay":
        paymentOrderType = dictionary.PostPaid;
        break;

      case "DirectCharge":
        paymentOrderType = dictionary.Charge;
        break;

      default:
        paymentOrderType = undefined;
        break;
    }

    const paymentOrderTypeTag: ITag = {
      key: dictionary.Type,
      value:
        data.paymentOrderType && !!paymentOrderType
          ? paymentOrderType
          : undefined,
      clearable: true,
    };

    tags = [endTime, beginTime, paymentOrderStates, paymentOrderTypeTag];
    this.tagService.createTags(tags);
  }

  convertMapType(type: string): string | undefined {
    const typeMap: { [key: string]: string } = {
      DirectCharge: "Charge",
      ChargeByPosOrder: "POS",
      ChargeByPostPay: "Postpaid",
    };
    return typeMap[type];
  }

  initFilterRequest(
    page: number,
    pageSize: number,
    filter?: PaymentFilterDtoDto
  ): void {
    if (filter?.from) {
      this.paymentOrderFilter.from = filter.from;
    } else this.paymentOrderFilter.from = undefined;
    if (filter?.end) {
      this.paymentOrderFilter.end = filter.end;
    } else this.paymentOrderFilter.end = undefined;

    if (filter?.paymentOrderType) {
      this.paymentOrderFilter.paymentOrderType = filter.paymentOrderType;
    } else this.paymentOrderFilter.paymentOrderType = undefined;
    this.paymentOrderFilter.pageNumber = page;
    this.paymentOrderFilter.pageSize = pageSize;
  }

  updateRouteParameters(filter: PaymentFilterDtoDto) {
    const params: Params = {
      beginTime: filter.from,
      endTime: filter.end,
      paymentOrderStates: filter.paymentOrderStates,
      paymentOrderType: filter.paymentOrderType,
      paymentOrderId: filter.paymentOrderId,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  redirectToPaymentPage(): void {
    this.router.navigate([`/branches/${this.branchId}/payment`]);
  }

  ngOnDestroy(): void {
    this.getPaymentOrders$.unsubscribe();
    this.getPaymentOrder$.unsubscribe();
    this.changeTagList$.unsubscribe();
    this.getCurrencies$.unsubscribe();
    this.removeTag$.unsubscribe();
  }
}
