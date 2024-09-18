// noinspection JSIgnoredPromiseFromCall

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
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

@Component({
  selector: "app-print",
  templateUrl: "./print.component.html",
  styleUrls: ["./print.component.scss", "./print.css"],
})
export class PrintComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  walletId: number = 0;
  initPage$ = new Subscription();
  currencies: any = [];
  credits: any[] = [];
  loading: boolean = false;
  showChargeModal: boolean = false;
  branchId: number;
  merchantId: number;
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
    private titleService: Title,
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

        this.currencies = res.currencies.currencies!.map((customer: any) => ({
          balance: customer.balance,
          currencyName: customer.currency.currencyName,
          type: "",
        })).filter((item) => item.balance > 0);

        this.credits = res.credits.currencies!.map((customer: any) => ({
          balance: customer.balance,
          currencyName: customer.currency.currencyName,
          type: "",
        })).filter((item) => item.balance > 0);

        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false
        throw Error(error.message);
      },
    });
  }

  initTitle() {
    this.titleService.setTitle(
      `${dictionary.MyWallet} - ${this.layoutService.branchName}`,
    );
  }

  submit(): void {
    this.loadingService.present();
    this.showChargeModal = false;
    setTimeout(() => {
      this.loadingService.dismiss();
      this.notificationService.showSuccessNotification(
        dictionary.ChargeSuccessMessage,
      );
    }, 1000);
  }

  onRefreshClick(): void {
    this.initPage();
  }

  makePdf() {
    window.print()
  }
  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
