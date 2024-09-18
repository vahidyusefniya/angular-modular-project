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
  BranchesClient,
  PaymentOrderState,
  PosOrder,
  PosOrderPaymentItem,
  PosOrderState,
  PosOrdersClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { combineLatest, lastValueFrom, Observable, Subscription } from "rxjs";
import {
  InprogressStates,
  IPosOrdersTags,
  PosOrdersFilterDto,
} from "../../dto/pos.dto";

@Component({
  selector: "app-all-orders",
  templateUrl: "./all-orders.component.html",
  styleUrls: ["./all-orders.component.scss"],
})
export class AllOrdersComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  loading: boolean = false;
  branchId: number;
  merchantId: number;
  page = 1;
  pageSize = 10;
  openPosOrdersFilterModal: boolean = false;
  cols: any[] = [
    {
      field: "posOrderId",
      header: dictionary.Id,
    },
    {
      field: "customerName",
      header: dictionary.Customer,
    },
    {
      field: "product",
      header: dictionary.ProductName,
    },
    {
      field: "isSubscriptive",
      header: dictionary.Subscriptive,
    },
    {
      field: "price",
      header: dictionary.Price,
    },

    {
      field: "quantity",
      header: dictionary.Quantity,
    },
    {
      field: "createdTime",
      header: dictionary.OrderTime,
    },
    {
      field: "paymentMethod",
      header: dictionary.PaymentMethod,
    },
    {
      field: "state",
      header: dictionary.State,
    },
    {
      field: "action",
      header: dictionary.Empty,
    },
  ];
  posOrders: PosOrder[] = [];
  posOrder = new PosOrder();
  posOrderFilter = new PosOrdersFilterDto();
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();
  tagList: ITag[] = [];
  openPosOrderModal: boolean = false;
  openConfirmationModal = false;
  changeStateSub$ = new Subscription();
  posOrderPaymentItemPaymentState = PaymentOrderState;
  customers: Branch[] = [];

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private router: Router,
    private posOrdersClient: PosOrdersClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private branchesClient: BranchesClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.State) {
        this.posOrderFilter.posOrderState = undefined;
      }
      if (tagsKey == dictionary.Customer) {
        this.posOrderFilter.subMerchantId = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.posOrderFilter!);
      this.initPage(this.posOrderFilter!);
    });

    this.layoutService.checkPagePermission("PosOrderRead");
  }

  ngOnInit() {
    const params = this.getUrlParams();
    if (params) {
      this.posOrderFilter.init({
        posOrderState: params.posOrderState
          ? (params.posOrderState as PosOrderState)
          : undefined,
        subMerchantId: params.subMerchantId ? params.subMerchantId : undefined,
        pageNumber: this.page,
        pageSize: this.pageSize,
      });
    }
    this.initPage(this.posOrderFilter!);
  }
  initPage(filter: PosOrdersFilterDto): void {
    const me = this;
    this.loading = true;
    combineLatest({
      subMerchantPosOrders: this.posOrdersClient.getSubMerchantPosOrders(
        this.branchId,
        filter.subMerchantId,
        filter.posOrderState,
        filter.pageNumber,
        filter.pageSize
      ),
      subMerchants: this.branchesClient.getSubMerchants(
        this.branchId,
        null,
        null,
        false
      ),
    }).subscribe({
      next(res) {
        me.loading = false;
        me.posOrders = res.subMerchantPosOrders ? res.subMerchantPosOrders : [];
        me.customers = res.subMerchants;
        me.createTagFromUrlParams();
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  getCapturedStates(posOrderPaymentItem: PosOrderPaymentItem[]) {
    return posOrderPaymentItem.filter(
      (x) => x.state === this.posOrderPaymentItemPaymentState.Captured
    ).length;
  }

  onRefreshClick() {
    this.getSubMerchantPosOrders(this.posOrderFilter);
  }

  onExcelExportClick() {
    (this.posOrderFilter.pageNumber = -1),
      (this.posOrderFilter.pageSize = null),
      this.getSubMerchantPosOrders(this.posOrderFilter).then((res) => {
        if (!res) return;
        let temp = [];
        temp = res.map((item: PosOrder) => {
          return {
            posOrderId: item.posOrderId,
            posId: item.pos.posId,
            posName: item.pos.name,
            merchantId: item.merchant.merchantId,
            merchantName: item.merchant.merchantName,
            isSubscriptive: item.pos.isSubscriptive,
            price: item.pos.price,
            currencyId: item?.pos.currency.currencyId,
            currencyName: item?.pos.currency.currencyName,
            quantity: item.quantity,
            paymentMethod: item.paymentMethod,
            posOrderState: item.state,
            paymentInstallmentCacheState: item.paymentInstallmentCacheState,
          };
        });
        temp = res;
        this.coreService.exportExcel(temp, dictionary.PosOrders);
      });
  }

  filterClick(filter: PosOrdersFilterDto) {
    this.openPosOrdersFilterModal = false;
    this.page = 1;
    this.posOrderFilter.pageNumber = 1;
    this.posOrderFilter.init(filter);
    this.updateRouteParameters(filter);
    this.getSubMerchantPosOrders(this.posOrderFilter);
  }
  updateRouteParameters(filter: PosOrdersFilterDto) {
    const params: Params = {
      posOrderState: filter.posOrderState,
      subMerchantId: filter.subMerchantId,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params) this.createTags(params);
  }
  getUrlParams(): IPosOrdersTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const posOrderState = httpParams.get("posOrderState")!;
    const subMerchantId = Number(httpParams.get("subMerchantId")!);

    let tags: IPosOrdersTags;
    tags = {
      posOrderState,
      subMerchantId,
    };

    return tags;
  }
  createTags(data: IPosOrdersTags): void {
    let tags: ITag[];

    let posOrderState;

    switch (data.posOrderState) {
      case InprogressStates:
        posOrderState = dictionary.Inprogress;
        break;

      case "2":
        posOrderState = PosOrderState.Paid;
        break;

      case "7":
        posOrderState = PosOrderState.Failed;
        break;

      case "6":
        posOrderState = PosOrderState.Shipping;
        break;

      case "5":
        posOrderState = dictionary.Complete;
        break;

      default:
        posOrderState = undefined;
        break;
    }

    const posOrderStateTag: ITag = {
      key: dictionary.State,
      value: data.posOrderState && !!posOrderState ? posOrderState : undefined,
      clearable: true,
    };
    const customerTag: ITag = {
      key: dictionary.Customer,
      value: this.customers.find((c) => c.merchantId == data.subMerchantId)
        ?.merchantName,
      clearable: true,
    };

    tags = [posOrderStateTag, customerTag];
    this.tagService.createTags(tags);
  }

  showDetail(data: PosOrder) {
    this.posOrder = data;
    this.openPosOrderModal = true;
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.posOrderFilter.pageNumber = data.page;
    this.getSubMerchantPosOrders(this.posOrderFilter);
  }

  onShippingClick(data: PosOrder): void {
    this.posOrder = data;
    this.openConfirmationModal = true;
  }
  onDeliveredClick(data: PosOrder): void {
    this.posOrder = data;
    this.openConfirmationModal = true;
  }

  confirmChangeState(description: string): void {
    this.loadingService.present();
    this.changeStateSub$ = this.posOrdersClient
      .changePosOrderState(
        this.branchId,
        this.posOrder.posOrderId,
        this.posOrder.state === "Paid"
          ? PosOrderState.Shipping
          : PosOrderState.Delivered
      )
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Order ${res.posOrderId} has changed status to ${
              this.posOrder.state === "Paid"
                ? dictionary.Shipping
                : dictionary.Delivered
            }.`
          );
          this.initPage(this.posOrderFilter);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  convertState(state: string): { status: string; icon: string } {
    const typeMap: { [key: string]: { status: string; icon: string } } = {
      WaitingForAutoPay: { status: "Inprogress", icon: "Inprogress_pos_order" },
      WaitingForPay: { status: "Inprogress", icon: "Inprogress_pos_order" },
      PaymentOrderCaptured: {
        status: "Inprogress",
        icon: "Inprogress_pos_order",
      },
      Shipping: { status: "Shipping", icon: "Shipping_pos_order" },
      Delivered: { status: "Complete", icon: "Complete" },
      Paying: { status: "Inprogress", icon: "Inprogress_pos_order" },
      Paid: { status: "Paid", icon: "Inprogress_pos_order" },
      Created: { status: "Inprogress", icon: "Inprogress_pos_order" },
      Failed: { status: "Failed", icon: "Failed" },
    };
    return typeMap[state];
  }

  async getSubMerchantPosOrders(
    filter: PosOrdersFilterDto
  ): Promise<PosOrder[] | undefined> {
    try {
      this.loading = true;
      const data = await lastValueFrom(
        this.posOrdersClient.getSubMerchantPosOrders(
          this.branchId,
          filter.subMerchantId,
          filter.posOrderState,
          filter.pageNumber,
          filter.pageSize
        )
      );

      this.posOrders = data;
      this.loading = false;
      this.createTagFromUrlParams();
      return data;
    } catch (error) {
      this.loading = false;
      return undefined;
    }
  }
  areArraysEqual(arr1: string[], arr2: string[]): boolean {
    return (
      arr1.length === arr2.length &&
      arr1.every((value, index) => value === arr2[index])
    );
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.changeStateSub$.unsubscribe();
  }
}
