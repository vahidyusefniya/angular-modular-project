// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "@app/core/services";
import { Currency } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { CreateCredit } from "../../dto/customer.dto";
import { CustomerService } from "@modules/customer/service/customer.service";
import { environment } from "@environments/environment";

@Component({
  selector: "app-credit",
  templateUrl: "./credit.component.html",
  styleUrls: ["./credit.component.scss"],
})
export class CreditComponent {
  dictionary = dictionary;
  credit = new CreateCredit();
  branchId: number;
  customerMerchantId: number | undefined;
  showDiscardAlert = false;
  showDescriptionAlert: boolean = false
  errorTextAmountInput: string | undefined;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  alertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showDiscardAlert = false;
      },
    },
    {
      text: dictionary.Discard,
      role: "confirm",
      handler: () => {
        this.modalCtrl.dismiss();
        this.showDiscardAlert = false;
        this.dismiss.emit();
        this.modalCtrl.dismiss();
      },
    },
  ];

  @Input() isOpen = false;
  @Input() variableTitle: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() createCredit = new EventEmitter();

  constructor(
    private coreService: CoreService,
    private modalCtrl: ModalController,
    private customerService: CustomerService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.customerMerchantId = this.customerService.branch?.merchantId;
  }

  onClickSave(): void {
    this.credit.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.credit.customerMerchantId = this.customerMerchantId;
    this.credit.amount = parseFloat(
      (this.credit.amount?.toString() as any).replace(/,/g, "")
    );

    if(this.credit.amount > 0){
      this.createCredit.emit(this.credit);
      this.credit = new CreateCredit();
      this.modalCtrl.dismiss();
    }
  }

  onInputAmount(amountEl: any) {
    let numberWithoutComma = !!amountEl.target.value ? amountEl.target.value.replace(/,/g, "") : amountEl.target.value;

    if (Number(numberWithoutComma) === 0) {
      this.errorTextAmountInput = `The amount must be greater than 0`;
    } else {
      this.errorTextAmountInput = "";
    }
  }

  checkIsForTest(currency: Currency) {
    this.showDescriptionAlert = currency.isForTest!
  }

  onDismiss(): void {
    if (
      this.credit.amount ||
      this.credit.currencyId ||
      this.credit.description
    ) {
      this.showDiscardAlert = true;
    } else {
      this.modalCtrl.dismiss();
      this.dismiss.emit();
    }
  }
}
