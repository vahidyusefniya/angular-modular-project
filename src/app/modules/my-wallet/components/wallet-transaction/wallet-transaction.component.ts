import { HttpParams } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router } from "@angular/router";
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
  BranchesClient,
  CurrenciesClient,
  Currency,
  TransferWalletType,
  WalletTransaction,
  WalletsClient,
} from "@app/proxy/proxy";
import { BuyOrder, BuyOrdersClient } from "@app/proxy/shop-proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { ResponseErrorDto } from "@core/dto/core.dto";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import {
  IWalletTransactionTags,
  WalletTransactionFilterDto,
} from "../../dto/my-wallet.dto";

@Component({
  selector: "app-wallet-transaction",
  templateUrl: "./wallet-transaction.component.html",
  styleUrls: ["./wallet-transaction.component.scss"],
})
export class WalletTransactionComponent implements OnInit {
  dictionary = dictionary;
  cols: ICol[] = [
    {
      hasLinkRow: true,
      hidden: false,
      width: "auto",
      field: "referenceNumber",
      header: dictionary.ReferenceId,
    },
    {
      hasLinkRow: true,
      hidden: false,
      width: "auto",
      field: "walletTransactionId",
      header: dictionary.SendAndReceiver,
    },
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
  loading = false;
  walletTransactions: WalletTransaction[] = [];
  getWalletTransaction$ = new Subscription();
  getCustomers$ = new Subscription();
  branchId: number;
  merchantId: number;
  openWalletTransactionFilter: boolean = false;
  walletTransactionFilter = new WalletTransactionFilterDto();
  page = 1;
  pageSize = 12;
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  openMultiSelectCustomerModal = false;
  customers: Branch[] = [];
  customer: Branch | undefined;
  customerName: string | undefined;
  priceListName: string | undefined;
  transferWalletType = TransferWalletType;
  currencies: Currency[] = [];
  getCurrenciesSub$ = new Subscription();
  openOrderLogs: boolean = false;
  orderDetail: BuyOrder | undefined;

  @Output() refresh = new EventEmitter();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService,
    private tagService: TagService,
    private branchesClient: BranchesClient,
    private walletClient: WalletsClient,
    private layoutService: LayoutService,
    private titleService: Title,
    private loadingService: LoadingService,
    private currenciesClient: CurrenciesClient,
    private ordersClient: BuyOrdersClient
  ) {
    this.walletId = this.layoutService.getWalletId();

    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.activatedRoute.queryParams.subscribe((params) => {
      this.customerName = params["customer"];
      this.priceListName = params["priceList"];
    });

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
      if (tagsKey == dictionary.Customer) {
        this.walletTransactionFilter.merchant = undefined;
      }
      if (tagsKey == dictionary.Type) {
        this.walletTransactionFilter.walletTransactionType = undefined;
      }

      if (tagsKey == dictionary.Currency) {
        this.walletTransactionFilter.currencyId = undefined;
      }
      this.page = 1;
      this.updateRouteParameters(this.walletTransactionFilter);
      this.getWalletTransactions(this.walletTransactionFilter);
    });

    this.layoutService.setTabName(
      `${dictionary.Reports} / ${dictionary.WalletTransactions}`
    );
  }

  ngOnInit() {
    this.getCustomers();
    this.getCurrencies();
    this.initTitle();
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
        walletTransactionType: params.type as TransferWalletType,
        currencyId: params.currencyId ? Number(params.currencyId) : undefined,
        pageNumber: this.page,
        pageSize: this.pageSize,
      });
    }
  }
  initTitle() {
    this.titleService.setTitle(
      `${dictionary.WalletTransactions} - ${dictionary.Reports} - ${this.layoutService.branchName}`
    );
  }

  getCustomers(): void {
    this.loading = true;
    this.getCustomers$ = this.branchesClient
      .getSubMerchants(this.branchId, null, null, false)
      .subscribe({
        next: (res) => {
          this.customers = res;
          this.initWalletTransactionFilterFromUrlParams();
          this.getWalletTransactions(this.walletTransactionFilter);
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
  }
  getWalletTransactions(filter: WalletTransactionFilterDto): void {
    this.loading = true;
    this.getWalletTransaction$ = this.walletClient
      .getWalletTransactions(
        this.branchId,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        filter.merchant?.merchantId,
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
          this.loading = false;
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
        throw Error(error.message);
      },
    });
  }

  refreshEvent() {
    this.getWalletTransactions(this.walletTransactionFilter);
    this.refresh.emit();
  }

  saveWalletTransactionFilter(filter: WalletTransactionFilterDto) {
    this.openWalletTransactionFilter = false;
    this.walletTransactionFilter.init(filter);
    this.page = 1;
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
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });

    const merchant = httpParams.get("merchant")!;
    const from = httpParams.get("from")!;
    const end = httpParams.get("end")!;
    const type = httpParams.get("type")!;
    const currencyId = httpParams.get("currencyId")!;

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
  closeCustomerSearchModal(): void {
    this.openMultiSelectCustomerModal = false;
    this.openWalletTransactionFilter = true;
  }
  confirmMultiSelectProfilesModal(data: Branch): void {
    this.customer = data;
    this.walletTransactionFilter.merchant = this.customer;
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
            amount: item.amount,
            state: item.transferWalletState,
            refrenceId: item.referenceNumber,
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
          // this.loading = false;
          throw Error(error.message);
        },
      });
  }

  openDetailModal(state: string, refrenceId: number) {
    this.loadingService.present();
    if (state === "buy") {
      this.ordersClient.getBuy(this.branchId, refrenceId).subscribe({
        next: (res) => {
          this.orderDetail = res;
          this.loadingService.dismiss();
          this.openOrderLogs = true;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
    } else {
      this.ordersClient.getSale(this.branchId, refrenceId).subscribe({
        next: (res) => {
          this.orderDetail = res;
          this.loadingService.dismiss();
          this.openOrderLogs = true;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.getWalletTransaction$.unsubscribe();
    this.changeTagList$.unsubscribe();
    this.removeTag$.unsubscribe();
    this.getCurrenciesSub$.unsubscribe();
    this.getCustomers$.unsubscribe();
  }
}
