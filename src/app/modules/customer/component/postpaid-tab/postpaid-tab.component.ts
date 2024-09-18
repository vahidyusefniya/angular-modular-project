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
import {
  Merchant,
  MerchantsClient,
  PatchOfBoolean,
  PaymentOrderState,
  PostPayClient,
  PostPayInvoiceItem,
  UpdateSubMerchantRequest,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertButton } from "@ionic/angular";
import { Subscription } from "rxjs";
import {
  BranchPostPayInvoiceFilterDto,
  IBranchPostPayInvoiceFilterDtoTag,
} from "../../dto/customer.dto";
import { CustomerService } from "../../service/customer.service";

@Component({
  selector: "app-postpaid-tab",
  templateUrl: "./postpaid-tab.component.html",
  styleUrls: ["./postpaid-tab.component.scss"],
})
export class PostpaidTabComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  branchId!: number;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  loading: boolean = false;
  merchantId: number;
  page = 1;
  pageSize = 10;
  cols: any[] = [
    {
      field: "postPayInvoiceId",
      header: dictionary.Id,
    },
    {
      field: "createdTime",
      header: dictionary.Time,
    },
    {
      field: "paymentId",
      header: dictionary.PaymentID,
    },
    {
      field: "amount",
      header: dictionary.Amount,
    },
    {
      field: "state",
      header: dictionary.State,
    },
  ];
  // postPaids: PostPayInvoice[] = [];
  postPaids: any[] = [];

  isOpen = false;
  header: string | undefined;
  message: string | undefined;
  buttons: AlertButton[] = [];
  branchPostPayInvoiceFilter = new BranchPostPayInvoiceFilterDto();
  openPostpaidFilterModal = false;
  tagList: ITag[] = [];
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();
  update$ = new Subscription();
  isActivePostPay: boolean | undefined = false;

  constructor(
    private customerService: CustomerService,
    private layoutService: LayoutService,
    private titleService: Title,
    private postPayClient: PostPayClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private merchantsClient: MerchantsClient,
    private notificationService: NotificationService
  ) {
    this.branchId = this.layoutService.branch!.branchId;
    this.merchantId = this.customerService.branch!.merchantId;

    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.BeginTime) {
        this.branchPostPayInvoiceFilter.beginTime = undefined;
      }
      if (tagsKey == dictionary.EndTime) {
        this.branchPostPayInvoiceFilter.endTime = undefined;
      }
      this.page = 1;
      this.updateRouteParameters(this.branchPostPayInvoiceFilter);
      this.initBranchPostPayInvoice(this.branchPostPayInvoiceFilter);
    });

    this.isActivePostPay =
      this.customerService.branch?.merchant?.isActivePostPay;
  }

  ngOnInit() {
    this.initBreadcrumbs();
    this.initTitle();
    this.initPage();
  }
  initTitle() {
    this.titleService.setTitle(
      `${this.customerService.branch?.merchantName} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }
  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      this.customerService.branch?.merchantName
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: dictionary.Customers,
      },
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: "",
      },
    ]);
  }
  initPage(): void {
    const params = this.getUrlParams();
    this.branchPostPayInvoiceFilter.init({
      beginTime: params?.beginTime ? new Date(params.beginTime) : undefined,
      branchId: this.branchId,
      endTime: params?.endTime ? new Date(params.endTime) : undefined,
      merchantId: this.merchantId,
      pageNumber: this.page,
      pageSize: this.pageSize,
    });
    this.initBranchPostPayInvoice(this.branchPostPayInvoiceFilter);
  }
  initBranchPostPayInvoice(data: BranchPostPayInvoiceFilterDto): void {
    this.loading = true;
    this.initPage$ = this.postPayClient
      .getSubMerchantsPostPayInvoices(
        data.branchId,
        data.merchantId,
        data.beginTime,
        data.endTime,
        data.pageNumber,
        data.pageSize
      )
      .subscribe({
        next: (res: PostPayInvoiceItem[]) => {
          this.loading = false;
          this.postPaids = res;
          this.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  onRefreshClick() {
    this.initBranchPostPayInvoice(this.branchPostPayInvoiceFilter);
  }
  onExcelExportClick() {
    this.loadingService.present();
    this.initPage$ = this.postPayClient
      .getSubMerchantsPostPayInvoices(
        this.branchPostPayInvoiceFilter.branchId,
        this.branchPostPayInvoiceFilter.merchantId,
        this.branchPostPayInvoiceFilter.beginTime,
        this.branchPostPayInvoiceFilter.endTime,
        -1,
        null
      )
      .subscribe({
        next: (res: PostPayInvoiceItem[]) => {
          this.loadingService.dismiss();
          this.coreService.exportExcel(res, "PostPayInvoice");
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  pageChanged(data: IPageChange): void {
    this.branchPostPayInvoiceFilter.pageNumber = data.page;
    this.initBranchPostPayInvoice(this.branchPostPayInvoiceFilter);
  }

  onBranchPostPayInvoiceFilter(data: BranchPostPayInvoiceFilterDto): void {
    this.openPostpaidFilterModal = false;
    this.branchPostPayInvoiceFilter.init(data);
    this.initBranchPostPayInvoice(this.branchPostPayInvoiceFilter);
    this.updateRouteParameters(this.branchPostPayInvoiceFilter);
  }
  updateRouteParameters(filter: BranchPostPayInvoiceFilterDto) {
    const params: Params = {
      beginTime: filter.beginTime,
      endTime: filter.endTime,
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
  getUrlParams(): IBranchPostPayInvoiceFilterDtoTag | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });

    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;

    let tags: IBranchPostPayInvoiceFilterDtoTag;
    tags = {
      beginTime,
      endTime,
    };

    return tags;
  }
  createTags(data: IBranchPostPayInvoiceFilterDtoTag): void {
    let tags: ITag[];

    let beginTime = new Date(data.beginTime!);
    const beginTimeTag: ITag = {
      key: dictionary.BeginTime,
      value: data.beginTime
        ? `${beginTime.getFullYear()}-${(beginTime.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${beginTime
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : undefined,
      clearable: true,
    };

    let endTime = new Date(data.endTime!);
    const endTimeTag: ITag = {
      key: dictionary.EndTime,
      value: data.endTime
        ? `${endTime.getFullYear()}-${(endTime.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${endTime.getDate().toString().padStart(2, "0")}`
        : undefined,
      clearable: true,
    };

    tags = [endTimeTag, beginTimeTag];
    this.tagService.createTags(tags);
  }

  onAutomaticPostpaidToggleClick(event: any): void {
    const me = this;
    let update = new UpdateSubMerchantRequest();
    let isActivePostPay = new PatchOfBoolean();
    if (this.isActivePostPay) {
      this.header = "Deactivate post paid";
      this.message = `Are you sure about the postpaid deactivation for <b>${this.customerService.branch?.merchantName}</b> customer?`;
      this.buttons = [
        {
          text: dictionary.Cancel,
          role: "cancel",
          handler() {
            me.isOpen = false;
          },
        },
        {
          text: dictionary.Deactive,
          role: "destructive",
          handler() {
            me.isActivePostPay = false;
            isActivePostPay.init({
              value: me.isActivePostPay,
            });
            update.init({
              isActivePostPay: isActivePostPay,
            });
            me.changeActivePostPayState(update);
            me.isOpen = false;
          },
        },
      ];
    } else {
      this.header = "Activate post paid";
      this.message = `Are you sure about the postpaid activation for <b>${this.customerService.branch?.merchantName}</b> customer?`;
      this.buttons = [
        {
          text: dictionary.Cancel,
          role: "cancel",
          handler() {
            me.isOpen = false;
          },
        },
        {
          text: dictionary.Active,
          role: "destructive",
          handler() {
            me.isActivePostPay = true;
            isActivePostPay.init({
              value: me.isActivePostPay,
            });
            update.init({
              isActivePostPay: isActivePostPay,
            });
            me.changeActivePostPayState(update);
            me.isOpen = false;
          },
        },
      ];
    }
    this.isOpen = true;
    event.stopImmediatePropagation();
  }
  changeActivePostPayState(data: UpdateSubMerchantRequest): void {
    this.loading = true;
    const me = this;
    this.update$ = this.merchantsClient
      .updateSubMerchant(this.branchId, this.merchantId, data)
      .subscribe({
        next(res: Merchant) {
          me.loading = false;
          me.notificationService.showSuccessNotification(
            `Customer "${res.merchantName}" has been Updated.`
          );
        },
        error: (error: ResponseErrorDto) => {
          me.loading = false;
          throw Error(error.message);
        },
      });
  }

  generatePaymentOrderStateName(data: any): string {
    const pendingStates = [
      PaymentOrderState.PaymentProviderCreated,
      PaymentOrderState.PaymentProviderCaptured,
      PaymentOrderState.PaymentProviderDisputed,
      PaymentOrderState.Created,
    ];

    return pendingStates.includes(data.paymentOrder.paymentOrderState)
      ? dictionary.Pending
      : data.paymentOrder.paymentOrderState;
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.changeTagList$.unsubscribe();
    this.removeTag$.unsubscribe();
  }
}
