// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { IWalletAndCredit, Withdraw } from "../../dto/customer.dto";
import { ActivatedRoute } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { CustomerService } from "@modules/customer/service/customer.service";
import { environment } from "@environments/environment";
import { Subscription } from "rxjs";
import { CurrenciesClient, Currency } from "@app/proxy/proxy";

@Component({
  selector: "app-withdraw",
  templateUrl: "./withdraw.component.html",
  styleUrls: ["./withdraw.component.scss"],
})
export class WithdrawComponent implements OnInit {
  dictionary = dictionary;
  withdraw = new Withdraw();
  branchId: number;
  customerMerchantId: number | undefined;
  priceRangeMessage: string = "";
  showDescriptionAlert: boolean = false;
  getCurrencies$ = new Subscription()
  @Input() isOpen = false;
  @Input() currency: IWalletAndCredit | undefined;
  @Input() crditBalance: number | undefined;
  @Input() differenceWalletCreditBalance: number | undefined;
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  constructor(
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private customerService: CustomerService,
    private alertController: AlertController,
    private currenciesClient: CurrenciesClient
  ) {
    this.branchId = coreService.getBranchId()!;
    this.customerMerchantId = this.customerService.branch?.merchantId;
  }

  ngOnInit() {
    this.initCurrencies()
    setTimeout(() => {
      var input = document.querySelector(".amount input");
      // @ts-ignore
      input.focus();
    }, 500);
    if (!this.differenceWalletCreditBalance) {
      this.differenceWalletCreditBalance = this.currency?.balanceWallet;
    } else {
      this.differenceWalletCreditBalance =
        this.differenceWalletCreditBalance!.toFixed(3)
          .slice(0, -1)
          .replace(/\.0+$/, "")
          .toLocaleString() as any;
    }

    
  }

  initCurrencies(): void {
    const me = this
    this.getCurrencies$ = this.currenciesClient.getCurrencies().subscribe({
      next(res: Currency[]) {
        const currency = res.find(x=> x.currencyId === me.currency?.currencyId!)
        me.showDescriptionAlert = currency?.isForTest!
      },
      error(error) {
        throw Error(error.message);
      },
    });
  }

  submitForm(): void {
    this.withdraw.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.withdraw.customerMerchantId = this.customerMerchantId;
    this.withdraw.amount = parseFloat(
      (this.withdraw.amount?.toString() as any).replace(/,/g, "")
    );

    this.submit.emit(this.withdraw);
    this.modalCtrl.dismiss();
  }

  onInput(amountEl: any) {
    let priceWithoutComma = amountEl.target.value.replace(/,/g, "");

    if (
      Number(priceWithoutComma) > this.differenceWalletCreditBalance! ||
      Number(priceWithoutComma) < 1
    ) {
      if (this.differenceWalletCreditBalance! === 1) {
        this.priceRangeMessage = `The amount must be 1`;
      } else {
        this.priceRangeMessage = `The amount must be between 1 and ${this.differenceWalletCreditBalance}`;
      }
    } else {
      this.priceRangeMessage = "";
    }
  }

  setBalance() {
    this.withdraw.amount = this.differenceWalletCreditBalance;
    this.priceRangeMessage = "";
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onDestroyed() {
    this.getCurrencies$.unsubscribe()
  }
}
