import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { CreateChargeOrdinaryPaymentOrderRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { IPaymentProfilesDto } from "../../dto/payment.dto";
import { LayoutService } from "@app/layout";

@Component({
  selector: "app-payment-information",
  templateUrl: "./payment-information.component.html",
  styleUrls: ["./payment-information.component.scss"],
})
export class PaymentInformationComponent implements OnInit {
  dictionary = dictionary;
  amount: number | undefined;
  maxAmountValue: number | undefined;
  minAmountValue: number | undefined;
  errorTextAmountInput: string | undefined;
  paymentOrder = new CreateChargeOrdinaryPaymentOrderRequest();
  branchId: number | undefined;
  isMobileSize:boolean = false;
  @Input() isOpen = false;
  @Input() payment: IPaymentProfilesDto | undefined;
  @Input() icon: string = 'assets/img/placeholder.jpg';
  @Output() dismiss = new EventEmitter();
  @Output() createPaymentOrder = new EventEmitter<CreateChargeOrdinaryPaymentOrderRequest>();

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
  });
  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.isMobileSize = this.layoutService.checkMobileSize();
  }
  ngOnInit(): void {
    this.minAmountValue = this.payment?.minAmount;
    this.maxAmountValue = this.payment?.maxAmount;
  }

  submitForm(): void {
    this.paymentOrder.amount = parseFloat(
      (this.amount?.toString() as any).replace(/,/g, "")
    );
    this.paymentOrder.paymentProfileId = this.payment?.paymentProfileId!;
    this.paymentOrder.returnUrl = `${window.location.origin}/branches/${this.branchId}/financial/peyments`;
    this.createPaymentOrder.emit(this.paymentOrder);
    this.onDismiss();
  }

  onInputAmount(amountEl: any) {
    let numberWithoutComma = amountEl.target.value.replace(/,/g, "");
    if (this.maxAmountValue || this.minAmountValue) {
      if (Number(numberWithoutComma) > this.maxAmountValue!) {
        this.errorTextAmountInput = `The amount must be smaller than ${this.maxAmountValue?.toLocaleString()}`;
      } else if (Number(numberWithoutComma) < this.minAmountValue!) {
        this.errorTextAmountInput = `The amount must be greater than ${this.minAmountValue?.toLocaleString()}`;
      } else {
        this.errorTextAmountInput = "";
      }
    }
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
