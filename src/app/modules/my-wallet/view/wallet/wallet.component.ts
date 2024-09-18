// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { CreditClient, WalletsClient } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";
import { Title } from "@angular/platform-browser";
import { ResponseErrorDto } from "@core/dto/core.dto";
import { IWalletAndCredit } from "@app/modules/customer/dto/customer.dto";

@Component({
  selector: "app-wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
})
export class WalletComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  walletId: number = 0;
  initPage$ = new Subscription();
  currencies: any = [];
  credits: any[] = [];
  loading: boolean = false;
  showChargeModal: boolean = false;
  branchId: number;
  merchantId: number;
  creditAndWalletList: IWalletAndCredit[] = [];

  cols: ICol[] = [
    {
      field: "currencyName",
      header: dictionary.Currency,
      hasNormalRow: true,
      isRouteLink: false,
      width: "auto",
      hidden: false,
    },
    {
      field: "balance",
      header: dictionary.Balance,
      hasNumberRow: true,
      width: "auto",
      hidden: false,
    },
  ];

  constructor(
    private walletsClient: WalletsClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private creditClient: CreditClient,
    private layoutService: LayoutService,
    private titleService: Title
  ) {
    this.walletId = this.layoutService.getWalletId();

    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
  }

  ngOnInit() {
    this.initTitle();
    this.initPage();
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      currencies: this.walletsClient.getWallet(this.branchId),
      credits: this.creditClient.getMyCredit(this.merchantId, this.branchId),
    }).subscribe({
      next: (res) => {
        this.currencies = res.currencies
          .currencies!.map((customer: any) => ({
            balance: customer.balance,
            currencyName: customer.currency.currencyName,
            type: "",
            currencyId: customer.currency.currencyId,
            isForTest: customer.currency.isForTest!,
          }))
          .filter((item) => item.balance >= 0);

        if (res.credits != null) {
          this.credits = res.credits
            .currencies!.map((customer: any) => ({
              balance: customer.balance,
              currencyName: customer.currency.currencyName,
              type: "",
              currencyId: customer.currency.currencyId,
              isForTest: customer.currency.isForTest!,
            }))
            .filter((item) => item.balance >= 0);
        }
        this.creditAndWalletList = [];
        this.mergeCreditsAndWalletsByCurrency();

        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  initTitle() {
    this.titleService.setTitle(
      `${dictionary.MyWallet} - ${this.layoutService.branchName}`
    );
  }

  mergeCreditsAndWalletsByCurrency(): void {
    if (this.currencies.length >= this.credits.length) {
      const creditMap = new Map();
      this.credits.forEach((credit) => {
        creditMap.set(credit.currencyId, credit);
      });

      this.currencies.forEach((wallet: any) => {
        const credit = creditMap.get(wallet.currencyId);
        if (credit) {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: credit.balance,
            currencyId: wallet.currencyId,
            currencyName: wallet.currencyName,
            isForTest: wallet.isForTest!,
          });
        } else {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: 0,
            currencyId: wallet.currencyId,
            currencyName: wallet.currencyName,
            isForTest: wallet.isForTest!,
          });
        }
      });
    } else {
      const creditMap = new Map();
      this.currencies.forEach((wallet: any) => {
        creditMap.set(wallet.currencyId, wallet);
      });

      this.credits.forEach((credit) => {
        const wallet = creditMap.get(credit.currencyId);
        if (wallet) {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: credit.balance,
            currencyId: credit.currencyId,
            currencyName: credit.currencyName,
            isForTest: credit.isForTest!,
          });
        } else {
          this.creditAndWalletList.push({
            balanceCredit: credit.balance,
            balanceWallet: 0,
            currencyId: credit.currencyId,
            currencyName: credit.currencyName,
            isForTest: credit.isForTest!,
          });
        }
      });
    }
  }

  submit(): void {
    this.loadingService.present();
    this.showChargeModal = false;
    setTimeout(() => {
      this.loadingService.dismiss();
      this.notificationService.showSuccessNotification(
        dictionary.ChargeSuccessMessage
      );
    }, 1000);
  }

  onRefreshClick(): void {
    this.initPage();
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
