import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { PaymentOrder, PaymentOrderStateLog } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-payment-order-detail-modal",
  templateUrl: "./payment-order-detail-modal.component.html",
  styleUrls: ["./payment-order-detail-modal.component.scss"],
})
export class PaymentOrderDetailModalComponent {
  dictionary = dictionary;
  cols: any[] = [
    {
      field: "State",
      header: dictionary.State,
    },
    {
      field: "createdTime",
      header: dictionary.CreatedTime,
    },
  ];

  @Input() isOpen = false;
  @Input() paymentOrder: PaymentOrder | undefined;
  @Input() stateLogs: PaymentOrderStateLog[] = [];

  @Output() dismiss = new EventEmitter();

  constructor(
    private modalController: ModalController,
    private coreService: CoreService
  ) {}

  checkIconState(stateId: number): string {
    if (stateId === 6) {
      return "Discharged";
    } else if (stateId === 5) {
      return "Charged";
    } else if (stateId === 7) {
      return "Failed";
    } else {
      return "inProgress__circle";
    }
  }

  onDismiss(): void {
    this.dismiss.emit();
    this.modalController.dismiss();
  }
}
