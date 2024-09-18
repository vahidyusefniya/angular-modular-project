// noinspection JSIgnoredPromiseFromCall,DuplicatedCode

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
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  TagService,
} from "@app/core/services";
import {
  Branch,
  CurrenciesClient,
  Currency,
  TransferWalletType,
  WalletTransaction,
  WalletsClient,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { ResponseErrorDto } from "@core/dto/core.dto";
import { dictionary } from "@dictionary/dictionary";
import { CustomerService } from "@modules/customer/service/customer.service";
import { Subscription } from "rxjs";
import {
  IWalletTransactionTags,
  WalletTransactionFilterDto,
} from "../../dto/wallet-transaction.dto";

@Component({
  selector: "app-wallet-transaction",
  templateUrl: "./wallet-transaction.component.html",
  styleUrls: ["./wallet-transaction.component.scss"],
})
export class WalletTransactionComponent implements OnInit, OnDestroy {
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

  walletTransactions: WalletTransaction[] = [];
  getWalletTransaction$ = new Subscription();
  branchId: number;
  merchantId: number;
  subMerchantId: number | undefined;
  openWalletTransactionFilter: boolean = false;
  walletTransactionFilter = new WalletTransactionFilterDto();
  page = 1;
  pageSize = 10;
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  openMultiSelectCustomerModal = false;
  customers: Branch[] = [];
  customer: Branch | undefined;
  transferWalletType = TransferWalletType;
  currencies: Currency[] = [];
  getCurrenciesSub$ = new Subscription();

  @Output() refreshEmiter = new EventEmitter();
  @Output() creditAction = new EventEmitter();
  @Output() chargeAction = new EventEmitter();
  @Input() loading = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService,
    private tagService: TagService,
    private walletClient: WalletsClient,
    private customerService: CustomerService,
    private loadingService: LoadingService,
    private currenciesClient: CurrenciesClient
  ) {
    this.walletId = this.customerService.branch?.merchant?.walletId!;

    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.subMerchantId = this.customerService.branch?.merchantId!;

    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.EndTime) {
        this.walletTransactionFilter.end = undefined;
      }
      if (tagsKey == dictionary.BeginTime) {
        this.walletTransactionFilter.from = undefined;
      }
      if (tagsKey == dictionary.Type) {
        this.walletTransactionFilter.walletTransactionType = undefined;
      }
      if (tagsKey == dictionary.Currency) {
        this.walletTransactionFilter.currencyId = undefined;
      }

      this.updateRouteParameters(this.walletTransactionFilter);
      this.getWalletTransactions(this.walletTransactionFilter);
    });
  }

  ngOnInit() {
    this.initWalletTransactionFilterFromUrlParams();
    this.getWalletTransactions(this.walletTransactionFilter);
    this.getCurrencies();
  }
  initWalletTransactionFilterFromUrlParams(): void {
    const params = this.getUrlParams();
    if (params) {
      if (params.merchant) {
        this.customer = this.customers.find(
          (x) => x.merchantId == Number(params.merchant)
        );
      }
      this.walletTransactionFilter.init({
        end: params.end,
        from: params.from,
        merchant: this.customer ? this.customer : undefined,
        walletTransactionType: params.type
          ? (params.type as TransferWalletType)
          : undefined,
        currencyId: params.currencyId ? Number(params.currencyId) : undefined,
        pageNumber: this.page,
        pageSize: this.pageSize,
      });
    }
  }

  refreshPage() {
    this.getWalletTransactions(this.walletTransactionFilter);
    this.refreshEmiter.emit();
  }

  getWalletTransactions(filter: WalletTransactionFilterDto): void {
    this.loading = true;
    this.getWalletTransaction$ = this.walletClient
      .getWalletTransactions(
        this.branchId,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.subMerchantId,
        filter.walletTransactionType,
        filter.currencyId,
        this.pageSize,
        this.page
      )
      .subscribe({
        next: (res) => {
          this.walletTransactions = res;
          this.createTagFromUrlParams();
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
  }

  getCurrencies(): void {
    this.getCurrenciesSub$ = this.currenciesClient.getCurrencies().subscribe({
      next: (res) => {
        this.currencies = res;
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
      complete: () => {
        this.loadingService.dismiss();
      },
    });
  }

  saveWalletTransactionFilter(filter: WalletTransactionFilterDto) {
    this.openWalletTransactionFilter = false;
    this.walletTransactionFilter.init(filter);
    this.updateRouteParameters(filter);
    this.getWalletTransactions(this.walletTransactionFilter);
  }
  updateRouteParameters(filter: WalletTransactionFilterDto) {
    const params: Params = {
      from: filter.from,
      end: filter.end,
      merchant: filter.merchant?.merchantId,
      type: filter.walletTransactionType,
      currencyId: filter.currencyId,
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
  getUrlParams(): IWalletTransactionTags | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });

    const merchant = httpParams.get("merchant")!;
    const from = httpParams.get("from")!;
    const end = httpParams.get("end")!;
    const type = httpParams.get("type")!;
    const currencyId = +httpParams.get("currencyId")!;

    let tags: IWalletTransactionTags;
    tags = {
      merchant,
      from,
      end,
      type,
      currencyId,
    };

    return tags;
  }
  createTags(data: IWalletTransactionTags): void {
    let tags: ITag[];
    const end: ITag = {
      key: dictionary.EndTime,
      value: data.end ? data.end.split("T")[0] : undefined,
      clearable: true,
    };
    const from: ITag = {
      key: dictionary.BeginTime,
      value: data.from ? data.from.split("T")[0] : undefined,
      clearable: true,
    };

    let customer = this.customers.find(
      (x) => x.merchantId === Number(data.merchant)
    );
    const merchant: ITag = {
      key: dictionary.Customer,
      value: data.merchant && !!customer ? customer.merchantName : undefined,
      clearable: true,
    };

    const typeTag: ITag = {
      key: dictionary.Type,
      value:
        data.type === TransferWalletType.Settle
          ? dictionary.SettleCredit
          : data.type,
      clearable: true,
    };

    const currencyTag = {
      key: dictionary.Currency,
      value: this.getCurrencyTag(Number(data.currencyId)),
      clearable: true,
    };

    tags = [end, from, merchant, typeTag, currencyTag];
    this.tagService.createTags(tags);
  }

  getCurrencyTag(id: number) {
    let findCurrency = this.currencies.find((item) => item.currencyId === id);
    return findCurrency?.currencyName;
  }

  showMerchantModal(): void {
    this.openMultiSelectCustomerModal = true;
    this.openWalletTransactionFilter = false;
  }
  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.walletTransactionFilter.pageNumber = data.page;
    this.getWalletTransactions(this.walletTransactionFilter);
  }
  onExcelExportClick(): void {
    const filter = this.walletTransactionFilter;
    // this.loading = true;
    this.loadingService.present();
    this.getWalletTransaction$ = this.walletClient
      .getWalletTransactions(
        this.branchId,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        filter.merchant?.merchantId,
        filter.walletTransactionType,
        filter.currencyId,
        undefined,
        -1
      )
      .subscribe({
        next: (res) => {
          let walletTransactions = res.map((item) => ({
            sender_receiver:
              item?.supplierMerchant?.merchantId != this.merchantId
                ? item?.supplierMerchant?.merchantName
                : item?.receiverMerchant?.merchantId != this.merchantId
                ? item?.receiverMerchant?.merchantName
                : "",
            created_time: item.createdTime,
            type:
              item.transferWalletType === TransferWalletType.Settle
                ? dictionary.SettleCredit
                : item.transferWalletType,
            currencyId: item.currency.currencyId,
            currencyName: item.currency.currencyName,
            receiverMerchantId: item?.receiverMerchant?.merchantId,
            receiverMerchantName: item?.receiverMerchant?.merchantName,
            supplierMerchantId: item?.supplierMerchant?.merchantId,
            supplierMerchantName: item?.supplierMerchant?.merchantName,
            bankId: item.bank?.bankId,
            bankName: item.bank?.bankName,
            amount: item.amount,
            state: item.transferWalletState,
          }));
          this.coreService.exportExcel(
            walletTransactions,
            "wallet_transactions"
          );
          // this.loading = false;
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  ngOnDestroy(): void {
    this.tagService.tagList = [];
    this.removeTag$.unsubscribe();
    this.changeTagList$.unsubscribe();
    this.getWalletTransaction$.unsubscribe();
  }
}
