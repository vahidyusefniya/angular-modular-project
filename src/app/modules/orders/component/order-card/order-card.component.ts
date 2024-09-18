import { Component, Input, OnInit } from "@angular/core";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { BuyOrder, BuyOrdersClient } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-order-card",
  templateUrl: "./order-card.component.html",
  styleUrls: ["./order-card.component.scss"],
})
export class OrderCardComponent implements OnInit {
  dictionary = dictionary;
  products: Array<{ quantity: number; unitBuyAmount: number }> = [];
  row: BuyOrder | undefined;
  openSendEmailModal: boolean = false;
  branchId: number;

  @Input() order: BuyOrder | undefined;

  constructor(
    private loadingService: LoadingService,
    private ordersClient: BuyOrdersClient,
    private coreService: CoreService,
    private notificationService: NotificationService
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit() {
    this.products.push({
      quantity: this.order?.quantity!,
      unitBuyAmount: this.order?.unitBuyAmount!,
    });
  }

  onSendEmailClick(data: BuyOrder) {
    this.row = data;
    this.openSendEmailModal = true;
  }

  saveSendEmailForm(data: any) {
    this.loadingService.present();
    this.ordersClient
      .resendProductCodes(
        this.branchId,
        this.row!.buyOrderId,
        data.deliveryType,
        data.email
      )
      .subscribe((response) => {
        this.loadingService.dismiss();

        this.notificationService.showSuccessNotification(
          `${data.deliveryType} ${this.dictionary.Sent}`
        );
      });
  }
}
