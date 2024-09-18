import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { CoreService, IPageChange, ITag, LoadingService, TagService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import {
  ISettleTransactionsTags,
  SettleTransactionsFilterDto,
} from "@modules/customer/dto/customer.dto";
import { CustomerService } from "@modules/customer/service/customer.service";
import { CreditClient, CreditTransactionType, WalletTransaction } from "@proxy/proxy";
import { Subscription } from "rxjs";

@Component({
  selector: "app-settle-transactions",
  templateUrl: "./settle-transactions.component.html",
  styleUrls: ["./settle-transactions.component.scss"],
})
export class SettleTransactionsComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  cols: ICol[] = [
    {
      hasNormalRow: true,
      hidden: false,
      width: "auto",
      field: "createdTime",
      hasDateTimeRow: true,
      header: dictionary.CreatedTime,
    },
    {
      hasNormalRow: true,
      hidden: false,
      width: "auto",
      field: "transferWalletType",
      header: dictionary.Type,
    },
    {
      hasAmountSign: true,
      hidden: false,
      width: "auto",
      field: "amount",
      header: dictionary.Amount,
      customClass: "text-right",
    },
    {
      hasNormalRow: true,
      hidden: false,
      width: "auto",
      field: "transferWalletState",
      header: dictionary.State,
    },
  ];
  walletId: number = 0;

  settleTransactions: WalletTransaction[] = [];
  branchId: number;
  merchantId: number;
  subMerchantId: number | undefined;
  openSettleTransactionFilterModal: boolean = false;
  settleTransactionFilter: any;
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  initPage$ = new Subscription();
  page = 1;
  pageSize = 10;
  settleTransactionsFilter = new SettleTransactionsFilterDto();

  @Input() loading: boolean = false;
  @Output() refreshEmiter = new EventEmitter();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService,
    private layoutService: LayoutService,
    private tagService: TagService,
    private creditClient: CreditClient,
    private customerService: CustomerService, 
    private loadingService: LoadingService
  ) {
    this.walletId = this.layoutService.getWalletId();

    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.subMerchantId = this.customerService.branch?.merchantId!;

    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey === dictionary.EndTime)
        this.settleTransactionsFilter.end = undefined;
      if (tagsKey === dictionary.BeginTime)
        this.settleTransactionsFilter.from = undefined;
      if (tagsKey === dictionary.TransactionType)
        this.settleTransactionsFilter.creditTransactionType = undefined;

      this.updateRouteParameters(this.settleTransactionsFilter);
      this.initPage(this.settleTransactionsFilter);
    });
  }

  ngOnInit() {
    const params = this.getUrlParams();
    if (params) {
      const creditTransactionType = params.creditTransactionType ? params.creditTransactionType === 'Credit' ? CreditTransactionType.Credit : CreditTransactionType.Settle : undefined
      this.settleTransactionsFilter.init({
        end: params.endTime,
        from: params.beginTime,
        creditTransactionType: creditTransactionType
      });
    }
    this.initPage(this.settleTransactionsFilter);
  }

  updateRouteParameters(filter: SettleTransactionsFilterDto) {
    const params: Params = {
      beginTime: filter.from,
      endTime: filter.end,
      creditTransactionType: filter.creditTransactionType
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  getUrlParams(): ISettleTransactionsTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const beginTime = httpParams.get("beginTime")!;
    const endTime = httpParams.get("endTime")!;
    const creditTransactionType = httpParams.get("creditTransactionType")!;

    let tags: ISettleTransactionsTags;
    tags = {
      beginTime,
      endTime,
      creditTransactionType
    };

    return tags;
  }

  initPage(filter: SettleTransactionsFilterDto): void {
    this.loading = true;
    this.initPage$ = this.creditClient
      .getCreditTransactions(
        this.merchantId,
        this.branchId,
        this.subMerchantId!,
        filter.creditTransactionType,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.pageSize,
        this.page
      )
      .subscribe((data) => {
        this.loading = false;
        this.settleTransactions = data;
        this.createTagFromUrlParams();
      });
  }

  createTagFromUrlParams(): void {
    const params = this.getUrlParams();
    if (params) this.createTags(params);
  }
  createTags(data: ISettleTransactionsTags): void {
    let tags: ITag[];
    const endTime: ITag = {
      key: dictionary.EndTime,
      value: data.endTime ? data.endTime.split("T")[0] : undefined,
      clearable: true,
    };
    const beginTime: ITag = {
      key: dictionary.BeginTime,
      value: data.beginTime ? data.beginTime.split("T")[0] : undefined,
      clearable: true,
    };

    const creditTransactionType: ITag = {
      key: dictionary.TransactionType,
      value: data.creditTransactionType ? data.creditTransactionType : undefined,
      clearable: true,
    };

    tags = [endTime, beginTime, creditTransactionType];
    this.tagService.createTags(tags);
  }

  saveSettleTransactionFilter(filter: SettleTransactionsFilterDto): void {
    this.openSettleTransactionFilterModal = false;
    this.settleTransactionsFilter.init(filter);
    this.updateRouteParameters(filter);
    this.initPage(this.settleTransactionsFilter);
  }
  refreshPage() {
    this.initPage(this.settleTransactionsFilter);
    this.refreshEmiter.emit();
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.initPage(this.settleTransactionsFilter);
  }

  onExcelExportClick(): void {
    // this.loading = true;
    this.loadingService.present()
    this.initPage$ = this.creditClient
      .getCreditTransactions(
        this.merchantId,
        this.branchId,
        this.subMerchantId!,
        undefined,
        this.settleTransactionsFilter.from
          ? new Date(this.settleTransactionsFilter.from)
          : undefined,
        this.settleTransactionsFilter.end
          ? new Date(this.settleTransactionsFilter.end)
          : undefined,
        this.pageSize,
        this.page
      )
      .subscribe((data) => {
        // this.loading = false;
        this.loadingService.dismiss()
        const exportData = data.map(
          (settleTransactions: WalletTransaction) => ({
            date: settleTransactions.createdTime,
            type: settleTransactions.transferWalletType,
            amount: settleTransactions.amount,
            state: settleTransactions.transferWalletState,
          })
        );
        if (exportData.length == 0) return;
        this.coreService.exportExcel(exportData, dictionary.SettleTransactions);
      });
  }
  ngOnDestroy(): void {
    this.tagService.tagList = [];
    this.initPage$.unsubscribe();
    this.changeTagList$.unsubscribe();
    this.removeTag$.unsubscribe();
  }
}
