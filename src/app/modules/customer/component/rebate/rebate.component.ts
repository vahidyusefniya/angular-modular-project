import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { CreateCredit } from "../../dto/customer.dto";
import { CustomerService } from "../../service/customer.service";
import { Currency } from "@app/proxy/proxy";

@Component({
  selector: "app-rebate",
  templateUrl: "./rebate.component.html",
  styleUrls: ["./rebate.component.scss"],
})
export class RebateComponent {
  dictionary = dictionary;
  rebate = new CreateCredit();
  branchId: number;
  customerMerchantId: number | undefined;
  showDiscardAlert = false;
  showDescriptionAlert: boolean = false;
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
  errorTextAmountInput: string | undefined;

  @Input() isOpen = false;
  @Input() variableTitle: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() createRebate = new EventEmitter();

  constructor(
    private coreService: CoreService,
    private modalCtrl: ModalController,
    private customerService: CustomerService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.customerMerchantId = this.customerService.branch?.merchantId;
  }

  onInputAmount(amountEl: any) {
    let numberWithoutComma = !!amountEl.target.value ? amountEl.target.value.replace(/,/g, "") : amountEl.target.value;

    if (Number(numberWithoutComma) === 0) {
      this.errorTextAmountInput = `The amount must be greater than 0`;
    } else {
      this.errorTextAmountInput = "";
    }
  }

  onClickSave(): void {
    this.rebate.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.rebate.customerMerchantId = this.customerMerchantId;
    this.rebate.amount = parseFloat(
      (this.rebate.amount?.toString() as any).replace(/,/g, "")
    );
    if(this.rebate.amount > 0){
      this.createRebate.emit(this.rebate);
      this.rebate = new CreateCredit();
      this.modalCtrl.dismiss();
    }
  }

  checkIsForTest(currency: Currency) {
    this.showDescriptionAlert = currency.isForTest!
  }

  onDismiss(): void {
    if (
      this.rebate.amount ||
      this.rebate.currencyId ||
      this.rebate.description
    ) {
      this.showDiscardAlert = true;
    } else {
      this.modalCtrl.dismiss();
      this.dismiss.emit();
    }
  }
}
