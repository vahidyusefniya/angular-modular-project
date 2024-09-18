// noinspection JSIgnoredPromiseFromCall

import { HttpParams } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
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
import { BuyOrder, CurrenciesClient, Currency } from "@app/proxy/proxy";
import {
  BuyOrderStateLog,
  BuyOrdersClient,
  ProductItemCode,
} from "@app/proxy/shop-proxy";

import {
  BuysFilterDto,
  IBuysTags,
  ResendDto,
  buyOrderStatesPending,
} from "@app/modules/reports/buys/dto/order.dto";
import { BuyOrder as ShopBuyOrder } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";

@Component({
  selector: "app-buys",
  templateUrl: "./buys.component.html",
  styleUrls: ["./buys.component.scss"],
})
export class BuysComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  digialCols = [
    {
      width: "auto",
      field: "buyOrderId",
      header: dictionary.Id,
    },
    {
      width: "auto",
      field: "productName",
      header: dictionary.Item,
    },
    {
      width: "auto",
      field: "unitBuyAmount",
      header: dictionary.UnitBuyPrice,
    },
    {
      width: "auto",
      field: "quantity",
      header: dictionary.Quantity,
    },
    {
      width: "auto",
      field: "totalBuyAmount",
      header: dictionary.TotalBuyPrice,
    },
    {
      width: "auto",
      field: "createdTime",
      header: dictionary.CreatedTime,
    },
    {
      width: "auto",
      field: "buyOrderState",
      header: dictionary.State,
    },
    {
      width: "auto",
      field: "buyOrderDelivery",
      header: dictionary.Recipient,
    },
    {
      width: "auto",
      field: "downloadCodes",
      header: dictionary.Empty,
    },
    {
      width: "auto",
      field: "action",
      header: dictionary.DeliveryType,
    },
  ];
  physicalCols = [
    {
      width: "auto",
      field: "buyOrderId",
      header: dictionary.Id,
    },
    {
      width: "auto",
      field: "productName",
      header: dictionary.Item,
    },
    {
      width: "auto",
      field: "unitBuyAmount",
      header: dictionary.UnitBuyPrice,
    },
    {
      width: "auto",
      field: "quantity",
      header: dictionary.Quantity,
    },
    {
      width: "auto",
      field: "totalBuyAmount",
      header: dictionary.TotalBuyPrice,
    },
    {
      width: "auto",
      field: "createdTime",
      header: dictionary.CreatedTime,
    },
    {
      width: "auto",
      field: "buyOrderState",
      header: dictionary.State,
    },
  ];
  loading = false;
  digitalCards: ShopBuyOrder[] = [];
  openOrderFilter = false;
  orderFilter = new BuysFilterDto();
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  initPage$ = new Subscription();
  branchId: number;
  orderDetailPath: string | undefined;
  page = 1;
  pageSize = 10;
  getOrders$ = new Subscription();
  openOrderStateLogs: boolean = false;
  stateLogs: BuyOrderStateLog[] = [];
  currencies: Currency[] = [];
  getBuysSub$ = new Subscription();
  searchCriteria: string | undefined;
  hasLocalPagination = false;
  order: ShopBuyOrder | undefined;
  detailOrderSub$ = new Subscription();
  openSendEmailModal: boolean = false;
  row: BuyOrder | undefined;
  activeIndex = 0;
  openTwoFaExceptionModal = false;
  resend = new ResendDto();
  action: "resend" | "getProductCodes" = "getProductCodes";

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private ordersClient: BuyOrdersClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private layoutService: LayoutService,
    private titleService: Title,
    private currenciesClient: CurrenciesClient,
    private notificationService: NotificationService
  ) {
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey === dictionary.EndTime) this.orderFilter.end = undefined;
      if (tagsKey === dictionary.BeginTime) this.orderFilter.from = undefined;
      if (tagsKey === dictionary.Currency) {
        this.orderFilter.currencyId = undefined;
      }
      if (tagsKey === dictionary.State) {
        this.orderFilter.buyOrderStates = undefined;
      }
      this.page = 1;
      this.updateRouteParameters(this.orderFilter);
      this.initPage(this.orderFilter);
    });
    this.branchId = coreService.getBranchId()!;
    this.orderDetailPath = `/${this.branchId}/reports/order-detail`;
    this.layoutService.checkPagePermission("BuyOrderRead");
  }

  ngOnInit() {
    const params = this.getUrlParams();
    if (params) {
      this.orderFilter.init({
        end: params.endTime,
        from: params.beginTime,
        currencyId: params.currencyId ? Number(params.currencyId) : undefined,
        buyOrderStates: params.buyOrderStates
          ? params.buyOrderStates
          : undefined,
      });
    }
    this.getCurrencies();
    this.initPage(this.orderFilter);
    this.initTitle();
  }
  initPage(filter: BuysFilterDto): void {
    const me = this;
    this.loading = true;
    this.initPage$ = combineLatest({
      orders: this.ordersClient.getBuyOrders(
        this.branchId,
        filter.currencyId,
        this.activeIndex === 0 ? false : true,
        this.searchCriteria,
        filter.buyOrderStates,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.page,
        this.pageSize
      ),
    }).subscribe({
      next(data) {
        me.loading = false;
        me.initOrders(data.orders);
        me.createTagFromUrlParams();
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  getCurrencies() {
    this.loading = false;
    this.currenciesClient.getCurrencies().subscribe({
      next: (data) => {
        this.loading = false;
        this.initCurrencies(data);
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  initOrders(orders: ShopBuyOrder[]): void {
    this.digitalCards = orders;
  }
  initTitle() {
    this.titleService.setTitle(
      `${dictionary.Buys} - ${dictionary.Reports} - ${this.layoutService.branchName}`
    );
  }
  initCurrencies(currencies: Currency[]): void {
    this.currencies = currencies;
  }
  getBuys(filter: BuysFilterDto): void {
    this.loading = true;
    this.getBuysSub$ = this.ordersClient
      .getBuyOrders(
        this.branchId,
        filter.currencyId,
        this.activeIndex === 0 ? false : true,
        this.searchCriteria,
        filter.buyOrderStates,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.digitalCards = res;
          this.page = 1;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
  saveBuysFilter(filter: BuysFilterDto): void {
    this.openOrderFilter = false;
    this.orderFilter.init(filter);
    this.updateRouteParameters(filter);
    this.page = 1;
    this.initPage(this.orderFilter);
  }
  updateRouteParameters(filter: BuysFilterDto) {
    const params: Params = {
      currencyId: filter.currencyId,
      beginTime: filter.from,
      endTime: filter.end,
      buyOrderStates: filter.buyOrderStates,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  getUrlParams(): IBuysTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const currencyId = httpParams.get("currencyId")!;
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;
    const buyOrderStates = httpParams.get("buyOrderStates")!;

    let tags: IBuysTags;

    tags = {
      currencyId,
      beginTime,
      endTime,
      buyOrderStates,
    };

    return tags;
  }
  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params) this.createTags(params);
  }

  isObjectEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null) {
        return false;
      }
    }
    return true;
  }

  createTags(data: IBuysTags): void {
    let fromDate = new Date(data.beginTime!);
    let endDate = new Date(data.endTime!);
    let tags: ITag[];
    const endTime: ITag = {
      key: dictionary.EndTime,
      value: data.endTime
        ? `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`
        : undefined,
      clearable: true,
    };
    const buyOrderStates: ITag = {
      key: dictionary.State,
      value:
        data.buyOrderStates === buyOrderStatesPending
          ? dictionary.Pending
          : data.buyOrderStates === "5"
          ? dictionary.Complete
          : data.buyOrderStates === "4"
          ? dictionary.Failed
          : undefined,
      clearable: true,
    };
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
    let customerTag: ITag = {
      key: dictionary.Currency,
      value: this.getCurrencyTag(data.currencyId)!,
      clearable: true,
    };
    tags = [customerTag, beginTime, endTime, buyOrderStates];
    this.tagService.createTags(tags);
  }

  getCurrencyTag(id: string): string | undefined {
    let currency = this.currencies.find(
      (currency) => currency.currencyId === Number(id)
    );
    return currency?.currencyName!;
  }
  onRefreshClick(): void {
    this.initPage(this.orderFilter);
  }
  onDownloadClick(data: BuyOrder, code?: string): void {
    this.action = "getProductCodes";
    this.row = data;
    this.loadingService.present();
    this.ordersClient
      .getProductCodes(this.branchId, data.buyOrderId, code)
      .subscribe({
        next: (res: ProductItemCode) => {
          let data: any[] = res.codes.map((item) => ({
            ["Product Name"]: res.productName,
            ["Product Price"]: res.productPrice,
            ["Currency"]: res.currency.currencyName,
            ["Card Number"]: item.cardNumber,
            ["PIN"]: item.pin,
            ["Expiration Time"]: item.expirationTime,
          }));
          this.coreService.exportExcel(data, "order__code");
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          if (error.typeName === dictionary.NeedToActive2FaException) {
            this.notificationService.showErrorAlertNotification(
              "Your 2FA verification is not enabled.",
              "2FA is inactive."
            );
          } else if (error.typeName === "Need2FaException") {
            this.openTwoFaExceptionModal = true;
          } else if (error.typeName === "Invalid2FaException") {
            this.notificationService.showErrorAlertNotification(
              "Your authentication code is wrong, Please try again.",
              "2FA is incorrect."
            );
          } else {
            this.notificationService.showErrorAlertNotification(
              JSON.stringify(error)
            );
          }
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }
  onExcelExportClick(): void {
    const filter = this.orderFilter;
    // this.loading = true;
    this.loadingService.present();
    this.getOrders$ = this.ordersClient
      .getBuyOrders(
        this.branchId,
        filter.currencyId,
        this.activeIndex === 0 ? false : true,
        this.searchCriteria,
        filter.buyOrderStates,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        -1,
        undefined
      )
      .subscribe({
        next: (res) => {
          let buys: any[] = [];
          buys = res.map(({ buyOrderDelivery, ...buy }: ShopBuyOrder) => ({
            ...buy,
            productCurrency: buy.productCurrency.currencyName,
            buyCurrency: buy.buyCurrency.currencyName,
            buyerMerchant: buy.buyerMerchant.merchantName,
            sellerMerchant: buy.sellerMerchant.merchantName,
            exchangeCalc: buy.exchangeCalc?.exchangeRate,
            deliveryType: buyOrderDelivery?.deliveryType,
            deliveryTypeValue: buyOrderDelivery?.deliveryTypeValue,
          }));
          this.coreService.exportExcel(buys, "orders");
          // this.loading = false;
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.initPage(this.orderFilter);
  }

  showDetailModal(order: BuyOrder) {
    this.loadingService.present();
    this.stateLogs = [];
    this.detailOrderSub$ = combineLatest({
      stateLogs: this.ordersClient.getBuyOrderStateLogs(
        this.branchId,
        order.buyOrderId!
      ),
      order: this.ordersClient.getBuy(this.branchId, order.buyOrderId!),
    }).subscribe({
      next: (res) => {
        this.loadingService.dismiss();
        this.stateLogs = res.stateLogs;
        this.order = res.order;
        this.openOrderStateLogs = true;
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }

  onInputSearch(value: any) {
    this.page = 1;
    if (!value) {
      this.searchCriteria = undefined;
    } else {
      this.searchCriteria = value;
    }
    this.getBuys(this.orderFilter);
  }

  onSendEmailClick(data: BuyOrder) {
    this.row = data;
    this.openSendEmailModal = true;
  }

  saveSendEmailForm(data: ResendDto, code?: string) {
    this.action = "resend";
    const me = this;
    this.resend.init(data);
    this.loadingService.present();
    this.ordersClient
      .resendProductCodes(
        this.branchId,
        this.row?.buyOrderId!,
        data.deliveryType!,
        data.email,
        code
      )
      .subscribe({
        next() {
          me.loadingService.dismiss();
          me.notificationService.showSuccessNotification(
            `${data.deliveryType} ${me.dictionary.Sent}`
          );
        },
        error: (error: ResponseErrorDto) => {
          me.loadingService.dismiss();
          if (error.typeName === dictionary.NeedToActive2FaException) {
            this.notificationService.showErrorAlertNotification(
              "Your 2FA verification is not enabled.",
              "2FA is inactive."
            );
          } else if (error.typeName === "Need2FaException") {
            this.openTwoFaExceptionModal = true;
          } else if (error.typeName === "Invalid2FaException") {
            this.notificationService.showErrorAlertNotification(
              "Your authentication code is wrong, Please try again.",
              "2FA is incorrect."
            );
          } else {
            this.notificationService.showErrorAlertNotification(
              JSON.stringify(error)
            );
          }
        },
      });
  }

  onTabChange(): void {
    this.searchCriteria = undefined;
    this.orderFilter.init({
      end: undefined,
      from: undefined,
      currencyId: undefined,
      buyOrderStates: undefined,
    });
    this.page = 1;
    this.updateRouteParameters(this.orderFilter);
    this.tagService.tagList = [];
    this.tagService.changeTagList.next(this.tagService.tagList);
    this.tagService.removeTag$.next("");
  }

  submitTwoFaException(
    code: string,
    action: "resend" | "getProductCodes"
  ): void {
    this.openTwoFaExceptionModal = false;
    if (action == "getProductCodes") this.onDownloadClick(this.row!, code);
    if (action == "resend") this.saveSendEmailForm(this.resend!, code);
  }

  ngOnDestroy(): void {
    this.changeTagList$.unsubscribe();
    this.removeTag$.unsubscribe();
    this.initPage$.unsubscribe();
    this.titleService.setTitle(``);
    this.searchCriteria = undefined;
  }
}
