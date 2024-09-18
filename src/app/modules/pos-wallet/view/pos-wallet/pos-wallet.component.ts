import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ResponseErrorDto } from '@app/core/dto/core.dto';
import { CoreService, LoadingService, NotificationService } from '@app/core/services';
import { LayoutService } from '@app/layout';
import { IWalletAndCredit } from '@app/modules/customer/dto/customer.dto';
import { CreditClient, WalletsClient } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-pos-wallet',
  templateUrl: './pos-wallet.component.html',
  styleUrls: ['./pos-wallet.component.scss'],
})
export class PosWalletComponent  implements OnInit {
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


  constructor(
    private walletsClient: WalletsClient,
    private coreService: CoreService,
    private creditClient: CreditClient,
    private layoutService: LayoutService,
    private titleService: Title,
    private router: Router
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
          }))
          .filter((item) => item.balance > 0);

        if (res.credits != null) {
          this.credits = res.credits
            .currencies!.map((customer: any) => ({
              balance: customer.balance,
              currencyName: customer.currency.currencyName,
              type: "",
              currencyId: customer.currency.currencyId,
            }))
            .filter((item) => item.balance > 0);
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
    if (this.currencies >= this.credits) {
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
          });
        } else {
          this.creditAndWalletList.push({
            balanceWallet: wallet.balance,
            balanceCredit: 0,
            currencyId: wallet.currencyId,
            currencyName: wallet.currencyName,
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
          });
        } else {
          this.creditAndWalletList.push({
            balanceCredit: credit.balance,
            balanceWallet: 0,
            currencyId: credit.currencyId,
            currencyName: credit.currencyName,
          });
        }
      });
    }
  }

  onSelectWallet(wallet: IWalletAndCredit) {
    this.router.navigate(
      [`branches/${this.branchId}/wallet`, wallet.currencyId],
      {  state: { currency: wallet } });
  }


  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
