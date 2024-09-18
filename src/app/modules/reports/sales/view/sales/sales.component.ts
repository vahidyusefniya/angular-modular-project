// noinspection JSIgnoredPromiseFromCall

import { HttpParams } from "@angular/common/http";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
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
import { buyOrderStatesPending } from "@app/modules/reports/buys/dto/order.dto";
import {
  IOrderTags,
  OrderFilterDto,
} from "@app/modules/reports/sales/dto/order.dto";
import {
  Branch,
  BranchesClient,
  BuyOrder,
  BuyOrdersClient,
  CurrenciesClient,
  Currency,
} from "@app/proxy/proxy";
import {
  BuyOrderStateLog,
  BuyOrder as ShopBuyOrder,
  BuyOrdersClient as ShopBuyOrdersClient,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";

@Component({
  selector: "app-sales",
  templateUrl: "./sales.component.html",
  styleUrls: ["./sales.component.scss"],
})
export class SalesComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  cols = [
    {
      width: "auto",
      field: "buyOrderId",
      header: dictionary.Id,
    },
    {
      width: "auto",
      field: "buyerMerchant",
      header: dictionary.Buyer,
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
  orders: BuyOrder[] = [];
  openOrderFilter = false;
  orderFilter = new OrderFilterDto();
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  initPage$ = new Subscription();
  branchId: number;
  orderDetailPath: string | undefined;
  page = 1;
  pageSize = 10;
  customers: Branch[] = [];
  getOrders$ = new Subscription();
  openOrderStateLogs: boolean = false;
  stateLogs: BuyOrderStateLog[] = [];
  searchCriteria: string | undefined;
  currencies: Currency[] = [];
  order: ShopBuyOrder | undefined;
  detailOrderSub$ = new Subscription();

  activeIndex = 0;

  @Input() customerId: number | undefined;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private ordersClient: BuyOrdersClient,
    private coreService: CoreService,
    private currenciesClient: CurrenciesClient,
    private branchesClient: BranchesClient,
    private layoutService: LayoutService,
    private titleService: Title,
    private loadingService: LoadingService,
    private shopBuyOrdersClient: ShopBuyOrdersClient
  ) {
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey === dictionary.EndTime) this.orderFilter.end = undefined;
      if (tagsKey === dictionary.BeginTime) this.orderFilter.from = undefined;
      if (tagsKey === dictionary.Customer) {
        this.orderFilter.customer = undefined;
      }
      if (tagsKey === dictionary.Currency) {
        this.orderFilter.currency = undefined;
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
        customer: params.customer ? Number(params.customer) : undefined,
        currency: params.currency ? Number(params.currency) : undefined,
        searchCriteria: undefined,
        buyOrderStates: params.buyOrderStates,
      });
    }
    if (this.customerId) {
      this.orderFilter.customer = this.customerId;
    }
    this.getCurrencies();
    this.initPage(this.orderFilter);
    this.initTitle();
  }
  initPage(filter: OrderFilterDto): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      customers: this.branchesClient.getSubMerchants(
        this.branchId,
        null,
        null,
        false
      ),
      orders: this.ordersClient.getSaleOrders(
        this.branchId,
        filter.customer,
        filter.currency,
        this.activeIndex === 0 ? false : true,
        filter.searchCriteria,
        filter.buyOrderStates,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.page,
        this.pageSize
      ),
    }).subscribe((data) => {
      this.loading = false;
      this.initOrders(data.orders);
      this.initCustomer(data.customers);
      this.createTagFromUrlParams();
    });
  }

  getCurrencies() {
    this.loading = false
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

  initCurrencies(currencies: Currency[]) {
    this.currencies = currencies;
  }
  getSaleOrders(filter: OrderFilterDto) {
    if (filter.searchCriteria && this.page !== 1) this.page = 1;
    this.loading = true;
    this.initPage$ = this.ordersClient
      .getSaleOrders(
        this.branchId,
        filter.customer,
        filter.currency,
        this.activeIndex === 0 ? false : true,
        filter.searchCriteria,
        filter.buyOrderStates,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.page,
        this.pageSize
      )
      .subscribe((data) => {
        this.loading = false;
        this.initOrders(data);
      });
  }
  initOrders(orders: BuyOrder[]): void {
    this.orders = orders;
  }
  initCustomer(customers: Branch[]): void {
    this.customers = customers;
  }

  initTitle() {
    this.titleService.setTitle(
      `${dictionary.Sales} - ${dictionary.Reports} - ${this.layoutService.branchName}`
    );
  }

  saveOrderFilter(filter: OrderFilterDto): void {
    this.openOrderFilter = false;
    this.orderFilter.init(filter);
    this.orderFilter.init(filter);
    this.updateRouteParameters(filter);
    this.page = 1;
    this.initPage(this.orderFilter);
  }
  updateRouteParameters(filter: OrderFilterDto) {
    const params: Params = {
      customer: filter.customer,
      beginTime: filter.from,
      endTime: filter.end,
      currency: filter.currency,
      buyOrderStates: filter.buyOrderStates,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  getUrlParams(): IOrderTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const customer = httpParams.get("customer")!;
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;
    const currency = httpParams.get("currency")!;
    const buyOrderStates = httpParams.get("buyOrderStates")!;

    let tags: IOrderTags;
    tags = {
      customer,
      beginTime,
      endTime,
      currency,
      buyOrderStates,
    };

    return tags;
  }
  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params && !this.isObjectEmpty(params)) this.createTags(params);
  }

  isObjectEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null) {
        return false;
      }
    }
    return true;
  }

  createTags(data: IOrderTags): void {
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
    const customer = this.customers.find(
      (c) => c.merchantId === Number(data.customer)
    );
    let customerTag: ITag = {
      key: dictionary.Customer,
      value: dictionary.Empty,
      clearable: true,
    };
    if (customer) {
      customerTag = {
        key: dictionary.Customer,
        value:
          customer.branchName === "root"
            ? customer.merchant?.merchantName
            : `${customer.branchName} ${customer.merchant?.merchantName}`,
        clearable: true,
      };
    }
    const currency = this.currencies.find(
      (c) => c.currencyId === Number(data.currency)
    );

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

    let currencyTag: ITag = {
      key: dictionary.Currency,
      value: currency?.currencyName,
      clearable: true,
    };

    tags = [currencyTag, customerTag, beginTime, endTime, buyOrderStates];
    this.tagService.createTags(tags);
  }

  onRefreshClick(): void {
    this.initPage(this.orderFilter);
  }
  onExcelExportClick(): void {
    const filter = this.orderFilter;
    // this.loading = true;
    this.loadingService.present();
    this.getOrders$ = this.ordersClient
      .getSaleOrders(
        this.branchId,
        filter.customer,
        filter.currency,
        this.activeIndex === 0 ? false : true,
        filter.searchCriteria,
        filter.buyOrderStates,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        -1,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          let sales: any[] = [];
          sales = res.map(({ saleManager, ...sale }: BuyOrder) => ({
            ...sale,
            productCurrency: sale.productCurrency.currencyName,
            buyCurrency: sale.buyCurrency.currencyName,
            buyerMerchant: sale.buyerMerchant.merchantName,
            sellerMerchant: sale.sellerMerchant.merchantName,
            exchangeCalc: sale.exchangeCalc?.exchangeRate,
            saleManagerName: sale.buyerMerchant.saleManager?.name,
          }));
          this.coreService.exportExcel(sales, "orders");
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
      stateLogs: this.shopBuyOrdersClient.getBuyOrderStateLogs(
        this.branchId,
        order.buyOrderId!
      ),
      order: this.shopBuyOrdersClient.getSale(this.branchId, order.buyOrderId!),
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

  searchSales(query: string) {
    this.page = 1;
    query ? this.orderFilter.searchCriteria = query : this.orderFilter.searchCriteria = undefined;
    this.getSaleOrders(this.orderFilter);
  }

  onTabChange(): void {
    this.searchCriteria = undefined;
    this.orderFilter.init({
      end: undefined,
      from: undefined,
      buyOrderStates: undefined,
      customer: undefined,
      currency: undefined,
    });
    this.page = 1;
    this.updateRouteParameters(this.orderFilter);
    this.tagService.tagList = [];
    this.tagService.changeTagList.next(this.tagService.tagList);
    this.tagService.removeTag$.next("");
  }

  ngOnDestroy(): void {
    this.changeTagList$.unsubscribe();
    this.removeTag$.unsubscribe();
    this.initPage$.unsubscribe();
    this.detailOrderSub$.unsubscribe();
  }
}
