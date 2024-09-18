// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";

import { CoreService } from "@app/core/services";
import { CreateChargeOrdinaryPaymentOrderRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

import { CustomerService } from "@modules/customer/service/customer.service";

@Component({
  selector: "app-create-payment",
  templateUrl: "./create-payment.component.html",
  styleUrls: ["./create-payment.component.scss"],
})
export class CreatePaymentComponent {
  dictionary = dictionary;
  paymentOrder = new CreateChargeOrdinaryPaymentOrderRequest();
  branchId: number;
  customerMerchantId: number | undefined;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });

  @Input() isOpen = false;
  @Input() variableTitle: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() createPaymentOrder = new EventEmitter();

  constructor(
    private coreService: CoreService,
    private modalCtrl: ModalController,
    private customerService: CustomerService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.customerMerchantId = this.customerService.branch?.merchantId;
  }

  ngOnInit(): void {
    // this.paymentOrder.currencyId = this.currencies.find(
    //   (c) => c.currencyName === "USD"
    // )?.currencyId!;
  }

  onClickSave(): void {
    this.paymentOrder.amount = parseFloat(
      (this.paymentOrder.amount?.toString() as any).replace(/,/g, "")
    );
    this.paymentOrder.returnUrl = window.location.href;
    this.createPaymentOrder.emit(this.paymentOrder);
    this.paymentOrder = new CreateChargeOrdinaryPaymentOrderRequest();
    this.modalCtrl.dismiss();
  }

  // getCurrencyName(id: number): string {
  //   let currencyName = this.currencies.find(
  //     (c) => c.currencyId === this.paymentOrder.currencyId
  //   )?.currencyName;
  //   return currencyName!;
  // }

  setAmount(amount: any): void {
    this.paymentOrder.amount = amount.toLocaleString();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
