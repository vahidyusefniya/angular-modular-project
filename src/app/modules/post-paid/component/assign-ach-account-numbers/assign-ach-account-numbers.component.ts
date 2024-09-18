// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { IAccountNumber } from "../../dto/pos-paid.dto";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService } from "@app/core/services";
import { PaymentProviderClient, PaymentProviderCustomerPanelLinkAccessType } from "@app/proxy/proxy";

@Component({
  selector: "app-assign-ach-account-numbers",
  templateUrl: "./assign-ach-account-numbers.component.html",
  styleUrls: ["./assign-ach-account-numbers.component.scss"],
})
export class AssignAchAccountNumbersComponent implements OnInit {
  dictionary = dictionary;
  paymentMethodProviderProfileId!: number;
  loadingCustomerPanelLink: boolean = false
  branchId: number | undefined;
  merchantId: number;

  @Input() accountNumbers: IAccountNumber[] = [];
  @Input() isOpen = false;
  @Input() title: string | undefined;
  @Input() loading: boolean = false;
  @Input() assignedPaymentMethodProviderProfileId: number | undefined;

  @Output() assignAccountNumber = new EventEmitter<{ id: number; name: string }>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private paymentProviderClient: PaymentProviderClient
  ) {
    this.branchId = this.coreService.getBranchId();
    this.merchantId = coreService.getMerchantId(this.branchId!)!;
  }

  ngOnInit() {
    if (this.assignedPaymentMethodProviderProfileId) this.paymentMethodProviderProfileId = this.assignedPaymentMethodProviderProfileId;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  createCustomerPanelLink() {
    this.loadingCustomerPanelLink = true;

    this.paymentProviderClient
      .getCustomerPanelLink(
        this.branchId!,
        this.merchantId,
        PaymentProviderCustomerPanelLinkAccessType.ElectronicCheck
      )
      .subscribe({
        next: (response: string) => {
          window.location.href = response;
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
        complete: () => {},
      });
  }

  onAssignAchAccountNumberClick(): void {
    const name = this.accountNumbers.find(
      (p) => p.paymentMethodProviderProfileId == this.paymentMethodProviderProfileId,
    )?.paymentMethodNumber;
    const data = {
      name: name!,
      id: this.paymentMethodProviderProfileId,
    };
    this.assignAccountNumber.emit(data);
    this.modalCtrl.dismiss();
  }
}
