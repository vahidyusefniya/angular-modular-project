// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Bank,
  BanksClient,
  Branch,
  BranchesClient,
  CreditClient,
  CurrenciesClient,
  Currency,
  CurrencyBalance,
  FinancialClient,
  FinancialOrderType,
  FinancialRequest,
  Wallet,
  WalletsClient,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController, AlertController } from "@ionic/angular";
import { CustomerService } from "@modules/customer/service/customer.service";
import { Subscription, combineLatest } from "rxjs";
import {
  CreateCharge,
  CreateCredit,
  IWalletAndCredit,
  Settle,
  Withdraw,
} from "../../dto/customer.dto";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  walletId: number = 0;
  initPage$ = new Subscription();
  getBanks$ = new Subscription();
  withdrawSub$ = new Subscription();
  currencies: any = [];
  banks: Bank[] = [];
  loading: boolean = false;
  showChargeModal: boolean = false;
  currencyId: number | undefined;
  merchantId: number;
  branchId: number;
  customerMerchantId: number | undefined;
  merchantName: string | undefined;
  allCurrency: any[] = [];
  createCharge$ = new Subscription();
  customerWallets: CurrencyBalance[] = [];
  currency: IWalletAndCredit | undefined;
  showWithdrawModal: boolean = false;
  customerCredits: any[] = [];
  showSettleModal = false;
  settleSub$ = new Subscription();
  showCreditModal = false;
  createCredit$ = new Subscription();
  minBalance: number | undefined;
  differenceWalletCreditBalance: number | undefined;
  crditBalance: number | undefined;
  creditAndWalletList: IWalletAndCredit[] = [];
  showRebateModal = false;
  isSmallMode = false;

  constructor(
    private walletsClient: WalletsClient,
    private branchesClient: BranchesClient,
    private financialClient: FinancialClient,
    private banksClient: BanksClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private customerService: CustomerService,
    private layoutService: LayoutService,
    private titleService: Title,
    private currenciesClient: CurrenciesClient,
    private creditClient: CreditClient,
    private alertController: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.walletId = this.customerService.branch?.merchant?.walletId!;
    this.customerMerchantId = this.customerService.branch?.merchantId;
    this.layoutService.isSmallMode.subscribe((isSmallMode) => {
      this.isSmallMode = isSmallMode;
    });
    this.isSmallMode = this.layoutService.checkMobileSize();
  }

  ngOnInit() {
    this.initBreadcrumbs();
    this.initTitle();
    this.initPage();
  }
  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      allCurrency: this.currenciesClient.getCurrencies(),
      customers: this.branchesClient.getSubMerchants(
        this.branchId,
        null,
        null,
        false
      ),
      banks: this.banksClient.getBanks(),
      customerWallets: this.walletsClient.getCustomerWallet(
        this.branchId,
        this.customerService.branch?.merchantId!
      ),
      credits: this.creditClient.getCustomerCredits(
        this.merchantId,
        this.branchId,
        this.customerService.branch?.merchantId!
      ),
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.getMerchantName(res.customers);
        this.initCurrencies(res.allCurrency);
        this.initCustomerCredits(res.credits);
        this.banks = res.banks;
        this.customerWallets =
          res.customerWallets != null ? res.customerWallets.currencies! : [];
        this.creditAndWalletList = [];
        this.mergeCreditsAndWallet();
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: this.initActionSheetItems(),
    });

    await actionSheet.present();
  }
  initActionSheetItems(): any[] {
    const items = [
      {
        id: 2,
        text: dictionary.Credit,
        handler: () => {
          this.showCreditModalClick();
        },
        permission: "FinancialCreate",
      },
      {
        id: 3,
        text: dictionary.Charge,
        handler: () => {
          this.showChargeModalClick();
        },
        permission: "FinancialCreate",
      },
      {
        id: 1,
        text: dictionary.Rebate,
        handler: () => {
          this.showRebateModalClick();
        },
        permission: "FinancialCreate",
      },
      {
        text: dictionary.Cancel,
        role: "cancel",
        data: {
          action: "cancel",
        },
      },
    ];

    return items;
  }

  mergeCreditsAndWallet(): void {
    if (this.customerWallets.length >= this.customerCredits.length) {
      const creditMap = new Map();
      this.customerCredits.forEach((credit) => {
        creditMap.set(credit.currencyId, credit);
      });

      this.customerWallets.forEach((wallet) => {
        const credit = creditMap.get(wallet.currency.currencyId);
        if (credit) {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: credit.balance,
            currencyId: wallet.currency.currencyId,
            currencyName: wallet.currency.currencyName,
            debt: credit.balance - wallet.balance,
            isForTest: wallet.currency.isForTest!,
          });
        } else {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: 0,
            currencyId: wallet.currency.currencyId,
            currencyName: wallet.currency.currencyName,
            debt: 0,
            isForTest: wallet.currency.isForTest!,
          });
        }
      });
    } else {
      const creditMap = new Map();
      this.customerWallets.forEach((wallet) => {
        creditMap.set(wallet.currency.currencyId, wallet);
      });

      this.customerCredits.forEach((credit) => {
        const wallet = creditMap.get(credit.currencyId);
        if (wallet) {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: credit.balance,
            currencyId: credit.currencyId,
            currencyName: credit.currencyName,
            debt: credit.balance - wallet.balance,
            isForTest: credit.currency.isForTest!,
          });
        } else {
          this.creditAndWalletList.push({
            balanceCredit: credit.balance,
            balanceWallet: 0,
            currencyId: credit.currencyId,
            currencyName: credit.currencyName,
            debt: 0,
            isForTest: credit.currency.isForTest!,
          });
        }
      });
    }
  }

  showWithdrawModalClick(customerWallet: IWalletAndCredit) {
    this.currencyId = customerWallet.currencyId;
    this.currency = customerWallet;
    this.crditBalance = 0;

    this.setDifferenceWalletCreditBalance(customerWallet);
    if (this.differenceWalletCreditBalance! > 0) {
      this.showWithdrawModal = true;
    } else {
      this.showAlertDifferenceWalletAndCreditBalanceIsMinus(customerWallet);
    }
  }
  setDifferenceWalletCreditBalance(customerWallet: IWalletAndCredit): void {
    this.differenceWalletCreditBalance =
      customerWallet.balanceWallet! - customerWallet.balanceCredit!;

    this.crditBalance = customerWallet.balanceCredit;
  }

  async showAlertDifferenceWalletAndCreditBalanceIsMinus(
    customerWallet: IWalletAndCredit
  ) {
    const alert = await this.alertController.create({
      header: "Withdrawal is not possible",
      message: ` The customer's credit is more than his wallet.<br><br>
      Wallet: ${customerWallet.balanceWallet?.toLocaleString()} (${
        customerWallet.currencyName
      })<br>
      Credit: ${customerWallet.balanceCredit?.toLocaleString()} (${
        customerWallet.currencyName
      })`,
      animated: false,
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
      ],
    });

    await alert.present();
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
  initTitle() {
    this.titleService.setTitle(
      `${this.customerService.branch?.merchantName} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }

  initCurrencies(data: Currency[]): void {
    this.allCurrency = data;
  }

  initCustomerCredits(data: Wallet): void {
    if (data != null) {
      this.customerCredits = data.currencies!.map(
        (credit: CurrencyBalance) => ({
          balance: credit.balance,
          currencyName: credit.currency.currencyName,
          currencyId: credit.currency.currencyId,
        })
      );
    }
  }

  getMerchantName(customers: Branch[]) {
    this.merchantName = customers.find(
      (customer) => customer.merchantId === this.customerMerchantId
    )?.merchantName;
  }

  showChargeModalClick(): void {
    this.showChargeModal = true;
  }

  createCharge(charge: CreateCharge): void {
    this.loadingService.present();
    const financial = new FinancialRequest();
    financial.init({
      customerMerchantId: charge.receiverMerchantId,
      currencyId: charge.currencyId,
      amount: charge.amount,
      description: charge.description,
      bankId: charge.bankId,
    });
    this.createCharge$ = this.financialClient
      .create(this.branchId, FinancialOrderType.Charge, financial)
      .subscribe({
        next: (res: number) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Charge request with ID ${res} was registered with unverified status.`
          );
          setTimeout(() => {
            this.initPage();
          }, 1000);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  submitWithdrawModal(withdraw: Withdraw): void {
    const financial = new FinancialRequest();
    financial.init({
      customerMerchantId: withdraw.customerMerchantId,
      currencyId: this.currencyId,
      amount: withdraw.amount,
      description: withdraw.description,
      bankId: null,
    });
    this.loadingService.present();
    this.withdrawSub$ = this.financialClient
      .create(this.branchId, FinancialOrderType.Withdraw, financial)
      .subscribe({
        next: (res: number) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Withdraw request with ID ${res} was registered with unverified status.`
          );
          setTimeout(() => {
            this.initPage();
          }, 1000);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  showSettleModalClick(currency: any): void {
    this.currencyId = currency.currencyId;
    this.currency = currency;
    this.computeMinBalane(currency);
    this.showSettleModal = true;
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
          setTimeout(() => {
            this.initPage();
          }, 1000);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  showCreditModalClick(): void {
    this.showCreditModal = true;
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
          setTimeout(() => {
            this.initPage();
          }, 1000);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  checkShowSettle(credit: any): boolean {
    let isShow = false;
    this.customerWallets.forEach((item) => {
      if (item.currency.currencyId === credit.currencyId) {
        if (item.balance > 0 && credit.balanceCredit > 0) {
          isShow = true;
        }
      }
    });
    return isShow;
  }

  computeMinBalane(credit: any) {
    this.customerWallets.forEach((item) => {
      if (item.currency.currencyId === credit.currencyId) {
        this.minBalance = Math.min(credit.balanceCredit, item.balance);
      }
    });
  }

  showRebateModalClick(): void {
    this.showRebateModal = true;
  }

  createRebate(rebate: CreateCredit): void {
    this.loadingService.present();
    const financial = new FinancialRequest();
    financial.init({
      customerMerchantId: rebate.customerMerchantId,
      currencyId: rebate.currencyId,
      amount: rebate.amount,
      description: rebate.description,
      bankId: null,
    });
    this.createCredit$ = this.financialClient
      .create(this.branchId, FinancialOrderType.Rebate, financial)
      .subscribe({
        next: (res: number) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Rebate request with ID ${res} was registered with unverified status.`
          );
          setTimeout(() => {
            this.initPage();
          }, 1000);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.createCharge$.unsubscribe();
    this.withdrawSub$.unsubscribe();
    this.settleSub$.unsubscribe();
    this.createCredit$.unsubscribe();
  }
}
