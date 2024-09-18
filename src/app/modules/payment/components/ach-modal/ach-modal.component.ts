import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { IPaymentMethodsDto, IPaymentProfilesDto } from "../../dto/payment.dto";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import {
  CreateChargeAutoPaymentOrderRequest,
  CreateChargeOrdinaryPaymentOrderRequest,
  PaymentProviderProfile,
} from "@app/proxy/proxy";

@Component({
  selector: "app-ach-modal",
  templateUrl: "./ach-modal.component.html",
  styleUrls: ["./ach-modal.component.scss"],
})
export class AchModalComponent implements OnInit {
  dictionary = dictionary;
  amount: number | undefined;
  branchId: number | undefined;
  isMobileSize: boolean = false;
  maxAmountValue: number | undefined;
  minAmountValue: number | undefined;
  errorTextAmountInput: string | undefined;
  paymentOrder = new CreateChargeAutoPaymentOrderRequest();
  @Input() isOpen = false;
  @Input() payment: IPaymentProfilesDto | undefined;
  @Input() icon: string = "assets/img/placeholder.jpg";
  @Input() paymentMethodsProfile: IPaymentMethodsDto[] = [];
  @Output() dismiss = new EventEmitter();
  @Output() createPaymentOrder = new EventEmitter<CreateChargeAutoPaymentOrderRequest>();
  @Output() getCustomerPanelLink = new EventEmitter<string>();

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

  onTextClick(paymentProfileName: string | undefined) {
    this.getCustomerPanelLink.emit(paymentProfileName);
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
