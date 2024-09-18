import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { CreateCredit, Settle } from "@app/modules/customer/dto/customer.dto";
import { CustomerService } from "@app/modules/customer/service/customer.service";
import {
  Branch,
  BranchesClient,
  CreditClient,
  CurrenciesClient,
  Currency,
  CurrencyBalance,
  FinancialClient,
  FinancialRequest,
  Wallet,
  FinancialOrderType,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";

@Component({
  selector: "app-credit-tab",
  templateUrl: "./credit-tab.component.html",
  styleUrls: ["./credit-tab.component.scss"],
})
export class CreditTabComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  loading: boolean = false;
  showCreditModal: boolean = false;
  showSettleModal: boolean = false;
  currencyId: number | undefined;
  merchantId: number;
  branchId: number;
  customerCredits: any[] = [];
  merchantName: string | undefined;
  allCurrency: any[] = [];
  createCredit$ = new Subscription();
  settleSub$ = new Subscription();
  currency: any;

  constructor(
    private branchesClient: BranchesClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private creditClient: CreditClient,
    private layoutService: LayoutService,
    private titleService: Title,
    private customerService: CustomerService,
    private financialClient: FinancialClient,
    private currenciesClient: CurrenciesClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
  }

  ngOnInit() {
    this.initBreadcrumbs();
    this.initTitle();
    this.initPage();
  }
  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      credits: this.creditClient.getCustomerCredits(
        this.merchantId,
        this.branchId,
        this.customerService.branch?.merchantId!
      ),
      customers: this.branchesClient.getSubMerchants(this.branchId, null, null, false),
      currencies: this.creditClient.getMyCredit(this.merchantId, this.branchId),
      allCurrency: this.currenciesClient.getCurrencies(),
    }).subscribe({
      next: (res) => {
        this.initCustomerCredits(res.credits);
        this.getMerchantName(res.customers);
        this.initCurrencies(res.allCurrency);
        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      `${this.customerService.branch?.merchantName}`
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: dictionary.Customers,
      },
      {
        url: `/branches/${this.branchId}/customers/${this.customerService.branch?.branchId}/credit`,
        deActive: false,
        label: dictionary.Detail,
      },
    ]);
  }
  initTitle() {
    this.titleService.setTitle(
      `${this.customerService.branch?.merchantName} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }

  initCustomerCredits(data: Wallet): void {
    this.customerCredits = data
      .currencies!.map((credit: CurrencyBalance) => ({
        balance: credit.balance,
        currencyName: credit.currency.currencyName,
        currencyId: credit.currency.currencyId,
      }))
      .filter((item) => item.balance > 0);
  }

  getMerchantName(customers: Branch[]) {
    this.merchantName = customers.find(
      (customer) =>
        customer.merchantId === this.customerService.branch?.merchantId
    )?.merchantName;
  }

  showSettleModalClick(currency: any): void {
    this.currencyId = currency.currencyId;
    this.currency = currency;
    this.showSettleModal = true;
  }

  showCreditModalClick(): void {
    this.showCreditModal = true;
  }

  initCurrencies(data: Currency[]): void {
    this.allCurrency = data;
  }

  createCredit(credit: CreateCredit) {
    this.loadingService.present();
    const financial = new FinancialRequest();
    financial.init({
      customerMerchantId: credit.customerMerchantId,
      currencyId: credit.currencyId,
      amount: credit.amount,
      description: credit.description,
      bankId: null,
    });
    this.createCredit$ = this.financialClient
      .create(this.branchId, FinancialOrderType.Credit, financial)
      .subscribe({
        next: (res: number) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Credit request with ID ${res} was registered with unverified status.`
          );
          this.initPage();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  submitSettleModal(settle: Settle): void {
    this.loadingService.present();
    const financial = new FinancialRequest();
    financial.init({
      customerMerchantId: settle.customerMerchantId,
      currencyId: this.currencyId!,
      amount: settle.amount,
      description: settle.description,
      bankId: null,
    });
    this.settleSub$ = this.financialClient
      .create(this.branchId, FinancialOrderType.Settle, financial)
      .subscribe({
        next: (res: number) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Settle request with ID ${res} was registered with unverified status.`
          );
          this.initPage();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.createCredit$.unsubscribe();
    this.settleSub$.unsubscribe();
    this.layoutService.setBreadcrumbVariable(``);
    this.layoutService.setBreadcrumbs([]);
  }
}
