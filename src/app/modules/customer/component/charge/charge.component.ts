// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

import { Bank, Currency } from "@app/proxy/proxy";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { CreateCharge } from "../../dto/customer.dto";
import { CustomerService } from "@modules/customer/service/customer.service";
import { CurrencyPipe } from "@angular/common";
import { environment } from "@environments/environment";

@Component({
  selector: "app-charge",
  templateUrl: "./charge.component.html",
  styleUrls: ["./charge.component.scss"],
  providers: [CurrencyPipe],
})
export class ChargeComponent implements OnInit {
  dictionary = dictionary;
  charge = new CreateCharge();
  receiverMerchantId: number = 0;
  branchId: number;
  amount: string | null | undefined;
  showDescriptionAlert: boolean = false;
  errorTextAmountInput: string | undefined;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  showDiscardAlert = false;
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

  @Input() banks: Bank[] = [];
  @Input() isOpen = false;
  @Input() variableTitle: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() createCharge = new EventEmitter();

  constructor(
    public coreService: CoreService,
    private modalCtrl: ModalController,
    private customerService: CustomerService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.receiverMerchantId = this.customerService.branch?.merchantId!;
  }

  ngOnInit() {
    this.charge.bankId =
      this.banks.length === 1 ? this.banks[0].bankId : undefined;
  }

  onClickSave(): void {
    this.charge.receiverMerchantId = this.receiverMerchantId;
    this.charge.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.charge.amount = parseFloat(
      (this.charge.amount?.toString() as any).replace(/,/g, "")
    );
    if(this.charge.amount > 0){
      this.createCharge.emit(this.charge);
      this.charge = new CreateCharge();
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
      this.charge.amount ||
      this.charge.currencyId ||
      this.charge.description ||
      this.charge.bankId
    ) {
      this.showDiscardAlert = true;
    } else {
      this.modalCtrl.dismiss();
      this.dismiss.emit();
    }
  }
}
