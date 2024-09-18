// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Settle } from "../../dto/customer.dto";
import { ActivatedRoute } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { CustomerService } from "@modules/customer/service/customer.service";
import { environment } from "@environments/environment";
import { Subscription } from "rxjs";
import { CurrenciesClient, Currency } from "@app/proxy/proxy";

@Component({
  selector: "app-settle",
  templateUrl: "./settle.component.html",
  styleUrls: ["./settle.component.scss"],
})
export class SettleComponent implements OnInit {
  dictionary = dictionary;
  settle = new Settle();
  branchId: number;
  customerMerchantId: number | undefined;
  priceRangeMessage: string = "";
  getCurrencies$ = new Subscription()
  showDescriptionAlert: boolean = false
  @Input() isOpen = false;
  @Input() currency: any;
  @Input() minBalance: any;
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
    this.settle.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.settle.customerMerchantId = this.customerMerchantId;
    this.settle.amount = parseFloat(
      (this.settle.amount?.toString() as any).replace(/,/g, "")
    );
    this.submit.emit(this.settle);
    this.modalCtrl.dismiss();
  }

  onInput(amountEl: any) {
    let priceWithoutComma = amountEl.target.value.replace(/,/g, "");

    if (
      Number(priceWithoutComma) > this.minBalance! ||
      Number(priceWithoutComma) < 1
    ) {
      if (this.minBalance === 1) {
        this.priceRangeMessage = `The amount must be 1`;
      } else {
        this.priceRangeMessage = `The amount must be between 1 and ${this.minBalance.toLocaleString()}`;
      }
    } else {
      this.priceRangeMessage = "";
    }
  }

  setBalance() {
    this.settle.amount = this.minBalance.toLocaleString();
    this.priceRangeMessage = "";
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
