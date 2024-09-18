// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Branch, BuyOrder, BuyOrderDeliveryType } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { ResendDto } from "../../dto/order.dto";

@Component({
  selector: "app-send-email",
  templateUrl: "./send-email.component.html",
  styleUrls: ["./send-email.component.scss"],
})
export class SendEmailComponent implements OnInit {
  dictionary = dictionary;
  myEmail: string | null | undefined = null;
  branchId: number | undefined;
  branch: Branch | undefined;
  email: string | undefined | null = null;
  myLabel: string = "";
  deliveryType: BuyOrderDeliveryType | undefined;

  @Input() order: BuyOrder | undefined;
  @Input() isOpen = false;
  @Output() submit = new EventEmitter<ResendDto>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branch = this.layoutService.branch;
  }

  ngOnInit() {
    if (
      this.order?.buyOrderDelivery === null ||
      this.order?.buyOrderDelivery?.deliveryType === "Email"
    ) {
      this.myEmail = this.branch?.merchant?.email;
      this.myLabel = dictionary.MyEmail;
      this.deliveryType = BuyOrderDeliveryType.Email;
    } else if (this.order?.buyOrderDelivery?.deliveryType === "Sms") {
      this.myEmail = this.branch?.merchant?.phoneNumber?.number;
      this.myLabel = dictionary.MyPhoneNumber;
      this.deliveryType = BuyOrderDeliveryType.Sms;
    } else {
      this.myEmail = this.branch?.merchant?.whatsappNumber?.number;
      this.myLabel = dictionary.MyWhatsApp;
      this.deliveryType = BuyOrderDeliveryType.WhatsApp;
    }
  }

  onEmailClick(email: string | undefined | null) {
    this.email = email;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onSubmitClick(): void {
    if (
      this.myEmail === null ||
      this.myEmail === this.order?.buyOrderDelivery?.deliveryTypeValue
    ) {
      this.email = this.order?.buyOrderDelivery?.deliveryTypeValue;
    }
    if (
      this.order?.buyOrderDelivery === null &&
      this.deliveryType === "Email"
    ) {
      this.email = this.myEmail;
    }
    this.submit.emit({
      email: this.email!,
      deliveryType: this.deliveryType,
      init(data) {},
    });
    this.modalCtrl.dismiss();
  }
}
