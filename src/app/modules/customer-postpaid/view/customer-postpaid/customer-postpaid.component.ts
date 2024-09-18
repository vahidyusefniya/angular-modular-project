import { HttpParams } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
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
import { CustomerService } from "@app/modules/customer/service/customer.service";
import {
  Branch,
  BranchesClient,
  PaymentOrderState,
  PostPayClient,
  PostPayInvoiceItem,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertButton } from "@ionic/angular";
import { Subscription } from "rxjs";
import {
  BranchPostPayInvoiceFilterDto,
  IBranchPostPayInvoiceFilterDtoTag,
} from "../../dto/customer.dto";

@Component({
  selector: "app-customer-postpaid",
  templateUrl: "./customer-postpaid.component.html",
  styleUrls: ["./customer-postpaid.component.scss"],
})
export class CustomerPostpaidComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  branchId!: number;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  getCustomers$ = new Subscription();
  loading: boolean = false;
  page = 1;
  pageSize = 10;
  cols: any[] = [
    {
      field: "postPayInvoiceId",
      header: dictionary.Id,
    },
    {
      field: "merchant",
      header: dictionary.Customer,
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
  customers: Branch[] = [];
  constructor(
    private customerService: CustomerService,
    private layoutService: LayoutService,
    private postPayClient: PostPayClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

    private branchesClient: BranchesClient
  ) {
    this.branchId = this.layoutService.branch!.branchId;

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
      if (tagsKey == dictionary.Customer) {
        this.branchPostPayInvoiceFilter.merchantId = undefined;
      }
      this.page = 1;
      this.updateRouteParameters(this.branchPostPayInvoiceFilter);
      this.initBranchPostPayInvoice(this.branchPostPayInvoiceFilter);
    });

    this.isActivePostPay =
      this.customerService.branch?.merchant?.isActivePostPay;
  }

  ngOnInit() {
    this.getCustomers();
    this.initPage();
  }
  initPage(): void {
    const params = this.getUrlParams();
    this.branchPostPayInvoiceFilter.init({
      beginTime: params?.beginTime ? new Date(params.beginTime) : undefined,
      branchId: this.branchId,
      endTime: params?.endTime ? new Date(params.endTime) : undefined,
      merchantId: Number(params?.merchantId),
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
        data.merchantId ? data.merchantId : undefined,
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

  getCustomers(): void {
    this.loading = true;
    this.getCustomers$ = this.branchesClient
      .getSubMerchants(this.branchId, null, null, false)
      .subscribe({
        next: (res) => {
          this.customers = res;
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
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
    this.page = data.page;
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
      merchantId: filter.merchantId,
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
    const merchantId = httpParams.get("merchantId")!;

    let tags: IBranchPostPayInvoiceFilterDtoTag;
    tags = {
      beginTime,
      endTime,
      merchantId,
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

    let merchantTag;

    if (data.merchantId) {
      let merchant = this.customers.find(
        (x) => x.merchantId === Number(data.merchantId)
      );
      merchantTag = {
        key: dictionary.Customer,
        value: merchant?.merchantName,
        clearable: true,
      };
    } else {
      merchantTag = {
        key: dictionary.Customer,
        value: undefined,
        clearable: true,
      };
    }

    tags = [endTimeTag, beginTimeTag, merchantTag];
    this.tagService.createTags(tags);
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
    this.getCustomers$.unsubscribe();
  }
}
