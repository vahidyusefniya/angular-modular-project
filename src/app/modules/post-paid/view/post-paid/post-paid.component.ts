import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
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
  Branch,
  CreatePosRequest,
  PaymentProviderClient,
  Pos,
  PosOrder,
  PosOrderPaymentMethod,
  PosOrderState,
  PosOrdersClient,
  PosesClient,
  PostPayClient,
  PostPayInvoiceItem,
  UpdatePosRequest,
  PaymentProviderPaymentMethodType,
  MerchantsClient,
  UpdateMerchantRequest,
  PatchOfInteger,
  BranchesClient,
  PaymentOrderState,
  PaymentOrder
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { combineLatest, Subscription } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { IAccountNumber, IPostPaidTags, PostPaidFilterDtoDto } from "../../dto/pos-paid.dto";
import { CustomerService } from "@app/modules/customer/service/customer.service";
import { ConvertLocalDateTimePipe } from "@app/shared/pipes";

@Component({
  selector: "app-post-paid",
  templateUrl: "./post-paid.component.html",
  styleUrls: ["./post-paid.component.scss"],
})
export class PostPaidComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  getPostPaid$ = new Subscription();
  loading: boolean = false;
  branchId: number;
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
      field: "paymentOrderId",
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
  postPaids: PostPayInvoiceItem[] = [];
  selectedBranch = new Branch();
  openAchAccountNumbersModal: boolean = false
  accountNumbers: IAccountNumber[] = []
  assignedPaymentMethodProviderProfileId: number | undefined;
  accountNumberName: string | undefined
  subBranchId: number | undefined;
  paymentMethodNumber: string | undefined
  convertLocalDateTimePipe = new ConvertLocalDateTimePipe()
  openPostPaidModalFilter: boolean = false
  postPaidFilter = new PostPaidFilterDtoDto();
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  tagList: ITag[] = [];

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private postPayClient: PostPayClient,
    private paymentProviderClient: PaymentProviderClient,
    private loadingService: LoadingService,
    private merchantService: MerchantsClient,
    private branchClient: BranchesClient,
    private customerService: CustomerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.selectedBranch = this.layoutService.getBranch(this.branchId)!;
    this.layoutService.checkPagePermission("MerchantPostPayRead");
    this.subBranchId = this.coreService.getSubBranchId()!;

    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.EndTime) {
        this.postPaidFilter.end = undefined;
      }
      if (tagsKey == dictionary.BeginTime) {
        this.postPaidFilter.from = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.postPaidFilter);
      this.initPostPaid(this.postPaidFilter);
    });
  }

  ngOnInit() {
    this.initFilterRequest(this.page, this.pageSize);
    const params = this.getUrlParams();
    if (params) {
      this.postPaidFilter.init({
        from: params.beginTime,
        end: params.endTime,
        pageNumber: this.page,
        pageSize: this.pageSize,
      });
    }
    this.initPage();
  }

  generatePaymentOrderStateName(data: PostPayInvoiceItem): string {
    if (
      data.paymentOrder?.paymentOrderState == PaymentOrderState.PaymentProviderCreated ||
      data.paymentOrder?.paymentOrderState == PaymentOrderState.PaymentProviderCaptured ||
      data.paymentOrder?.paymentOrderState == PaymentOrderState.PaymentProviderDisputed ||
      data.paymentOrder?.paymentOrderState == PaymentOrderState.Created
    )
      return dictionary.Pending;
    else return data.paymentOrder?.paymentOrderState!;
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      paymentMethods: this.paymentProviderClient.getMerchantPaymentMethods(
        this.branchId!,
        this.merchantId
      ),
      postPayInvoices: this.postPayClient.getMyPostPayInvoiceItems(
        this.branchId,
        this.postPaidFilter.from ? new Date(this.postPaidFilter.from) : undefined,
        this.postPaidFilter.end ? new Date(this.postPaidFilter.end) : undefined,
        this.page,
        this.pageSize
      )
    }).subscribe({
      next: (res) => {
        this.accountNumbers = [...res.paymentMethods].filter(x=> x.paymentMethodType === PaymentProviderPaymentMethodType.ElectronicCheck.toString()).map((item) => {
          return {
            paymentMethodProviderProfileId: item?.providerProfiles ? item?.providerProfiles[0].paymentMethodProviderProfileId! : undefined,
            paymentMethodNumber: item.paymentMethodNumber!
          }
        })

        const accountNumber = this.accountNumbers.find(x=> x.paymentMethodProviderProfileId === this.selectedBranch.merchant?.postPayAchPaymentMethodProviderProfileId)
        this.assignedPaymentMethodProviderProfileId = accountNumber?.paymentMethodProviderProfileId
        this.paymentMethodNumber = accountNumber?.paymentMethodNumber
        this.postPaids = res.postPayInvoices
        this.createTagFromUrlParams();
      },
      error: (error: ResponseErrorDto) => {
        this.createTagFromUrlParams();
        throw Error(error.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getUrlParams(): IPostPaidTags | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;

    let tags: IPostPaidTags;

    tags = {
      beginTime,
      endTime
    };

    return tags;
  }

  assignAccountNumber(data: { id: number; name: string }): void {
    this.loadingService.present();
    const requestData = new UpdateMerchantRequest({
      postPayAchPaymentMethodProviderProfileId: new PatchOfInteger({
        value: data.id
      })
    })
    this.merchantService
      .update(this.branchId, this.merchantId, requestData)
      .subscribe({
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.accountNumberName = data.name;
          this.assignedPaymentMethodProviderProfileId = data.id;
          this.loadingService.dismiss();
          this.getBranch();
        },
      });
  }

  getBranch() {
    this.loading = true;
    this.branchClient
      .get(this.branchId!, false)
      .subscribe((response: Branch) => {
        this.customerService.setBranch(response);

        this.loading = false;
      });
  }

  onRefreshClick() {
    this.initPage();
  }

  showDetail(data: number) {
    this.router.navigate([`/branches/${this.branchId}/financial/peyments`], {
      queryParams: {
        paymentOrderType: 'ChargeByPostPay',
        paymentOrderId: data
      }
    });
  }

  onExcelExportClick() {
    this.loading = true;
    this.initPage$ = this.postPayClient.getMyPostPayInvoiceItems(
      this.branchId,
      this.postPaidFilter.from ? new Date(this.postPaidFilter.from) : undefined,
      this.postPaidFilter.end ? new Date(this.postPaidFilter.end) : undefined,
      -1
    )
      .subscribe({
        next: (res) => {
          this.loading = false;
          let temp = [];
          temp = res.map(item => {
            return {
              id: item.postPayInvoiceId,
              time: this.convertLocalDateTimePipe.transform(item.createdTime.toISOString()),
              amount: item.amount,
              state: item.paymentOrder?.paymentOrderState
            }
          });
          this.coreService.exportExcel(temp, dictionary.PostPaid);
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  onAchAccountNumberClick(): void {
    this.openAchAccountNumbersModal = true;
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.postPaidFilter.pageNumber = data.page;
    this.initPostPaid(this.postPaidFilter);
  }

  savePostPaidFilter(filter: PostPaidFilterDtoDto) {
    this.openPostPaidModalFilter = false;
    this.postPaidFilter.init(filter);
    this.page = 1;
    this.initFilterRequest(this.page, this.pageSize, filter);
    this.updateRouteParameters(filter);
    this.createTagFromUrlParams();
    this.initPostPaid(filter);
  }

  initFilterRequest(
    page: number,
    pageSize: number,
    filter?: PostPaidFilterDtoDto
  ): void {
    if (filter?.from) {
      this.postPaidFilter.from = filter.from;
    } else this.postPaidFilter.from = undefined;
    if (filter?.end) {
      this.postPaidFilter.end = filter.end;
    } else this.postPaidFilter.end = undefined;
    this.postPaidFilter.pageNumber = page;
    this.postPaidFilter.pageSize = pageSize;
  }

  updateRouteParameters(filter: PostPaidFilterDtoDto) {
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

  createTagFromUrlParams(): void {
    this.createTags({
      beginTime: this.postPaidFilter.from!,
      endTime: this.postPaidFilter.end!,
    });
  }

  createTags(data: IPostPaidTags): void {
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

    tags = [endTime, beginTime];
    this.tagService.createTags(tags);
  }

  initPostPaid(filter: PostPaidFilterDtoDto): void {
    this.loading = true;
    this.getPostPaid$ = this.postPayClient.getMyPostPayInvoiceItems(
        this.branchId!,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        filter.pageNumber,
        filter.pageSize
      )
      .subscribe({
        next: (res: PostPayInvoiceItem[]) => {
          this.loading = false;
          this.postPaids = res;
          this.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          this.createTagFromUrlParams();
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.getPostPaid$.unsubscribe();
  }
}
