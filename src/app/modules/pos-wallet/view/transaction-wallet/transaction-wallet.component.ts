import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseErrorDto } from '@app/core/dto/core.dto';
import { CoreService, LoadingService } from '@app/core/services';
import { LayoutService } from '@app/layout';
import { Branch, CurrenciesClient, Currency, WalletsClient, WalletTransaction } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-transaction-wallet',
  templateUrl: './transaction-wallet.component.html',
  styleUrls: ['./transaction-wallet.component.scss'],
})
export class TransactionWalletComponent  implements OnInit {
  dictionary = dictionary;
  currencyId: number | undefined;
  currency: Currency | undefined;
  loading: boolean | undefined;
  pageLoading: boolean | undefined;
  walletTransactions: WalletTransaction[] = [];
  branchId: number | undefined;
  merchantId: number | undefined;
  branch: Branch | undefined;
  currentSize: number | undefined;
  debounce: any = null
  page = 1;
  pageSize = 10;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private currenciesClient: CurrenciesClient,
    private loadingService: LoadingService,
    private walletClient: WalletsClient,
    private coreService: CoreService,
    private layoutService: LayoutService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.branch = this.layoutService.getBranch(this.branchId);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.currency = navigation.extras.state['currency'];
      this.getWalletTransactions("init");
    } else {
      this.activatedRoute.params.subscribe(params => {
        this.currencyId = +params['currencyId'];
        this.getCurrencies(this.currencyId);
      });
    }
  }

  ngOnInit() {

  }

  getCurrencies(currencyId: number) {
    this.loadingService.present()
    this.currenciesClient.getCurrencies().subscribe({
      next: (res: Currency[]) => {
        this.currency = res.find(item => item.currencyId === currencyId);
        this.getWalletTransactions("init");
        this.loadingService.dismiss()
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss()
        throw Error(error.message);
      }
    })
  }

  getWalletTransactions(type: "scroll" | "init"): void {
    this.loadingHandler(type);
    this.loading = true;
    this.walletClient
      .getWalletTransactions(
        this.branchId!,
        undefined,
        undefined,
        undefined,
        undefined,
        this.currencyId,
        this.pageSize,
        this.page
      )
      .subscribe({
        next: (res) => {
          this.currentSize = res.length < this.pageSize! ? 0 : res.length;
          res.forEach(item => this.walletTransactions.push(item))
          this.loading = false;
          this.pageLoading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          this.pageLoading = false;
          throw Error(error.message);
        },
      });
  }

  onScroll(ev: any): void {
    if (this.currentSize && this.currentSize > 0) {
      this.loading = true
      this.debounce = setTimeout(() => {
        clearTimeout(this.debounce)
        if (this.currentSize! < 99) {
          this.page = this.page! + 1;
          this.getWalletTransactions('scroll');
          (ev as InfiniteScrollCustomEvent).target.complete();
        }
      }, 1000);
    }
  }

  loadingHandler(type: "scroll" | "init") {
    if (type === "init") {
      this.pageLoading = true;
    } else {
      this.loading = true;
    }
  }


}
