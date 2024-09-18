// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Branch } from "@app/proxy/proxy";
import { BuyOrder } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonModal, ModalController } from "@ionic/angular";

@Component({
  selector: "app-send-email",
  templateUrl: "./send-email.component.html",
  styleUrls: ["./send-email.component.scss"],
})
export class SendEmailComponent implements OnInit {
  dictionary = dictionary;
  myEmail: string | null | undefined;
  branchId: number | undefined;
  branch: Branch | undefined;
  email: string | null | undefined = null;
  myLabel: string = "";
  deliveryType: string = "";

  @Input() order: BuyOrder | undefined;
  @Input() isOpen = false;
  @ViewChild("receiveModal") receiveModal!: IonModal;
  @Output() submit = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.branch = this.layoutService.branch;
  }

  ngOnInit() {
    if (
      this.order?.buyOrderDelivery === null ||
      this.order?.buyOrderDelivery?.deliveryType === "Email"
    ) {
      this.myEmail = this.branch?.merchant?.email;
      this.myLabel = dictionary.MyEmail;
      this.deliveryType = "Email";
    } else if (this.order?.buyOrderDelivery?.deliveryType === "Sms") {
      this.myEmail = this.order?.buyOrderDelivery?.deliveryTypeValue;
      this.myLabel = dictionary.MyPhoneNumber;
      this.deliveryType = "Sms";
    } else {
      this.myEmail = this.order?.buyOrderDelivery?.deliveryTypeValue;
      this.myLabel = dictionary.MyWhatsApp;
      this.deliveryType = "WhatsApp";
    }
  }

  onEmailClick(email: string | null | undefined) {
    this.email = email;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onSubmitClick(): void {
    let deliveryType: string | null;
    deliveryType = this.order?.buyOrderDelivery
      ? this.order.buyOrderDelivery.deliveryType
      : "Email";

    if (
      (!this.order?.buyOrderDelivery?.deliveryTypeValue ||
        this.branch?.merchant?.email === null) &&
      deliveryType === "Email"
    ) {
      this.email = this.myEmail;
    }

    if (
      this.order?.buyOrderDelivery?.deliveryType === "Sms" ||
      this.order?.buyOrderDelivery?.deliveryType === "WhatsApp"
    ) {
      this.email = this.order?.buyOrderDelivery.deliveryTypeValue;
    }

    this.submit.emit({ email: this.email, deliveryType });
    this.modalCtrl.dismiss();
  }
}
