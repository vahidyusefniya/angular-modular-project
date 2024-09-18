// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { BuyOrder, BuyOrderStateLog } from "@app/proxy/shop-proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-buys-state-logs",
  templateUrl: "./buys-state-logs.component.html",
  styleUrls: ["./buys-state-logs.component.scss"],
})
export class BuysStateLogsComponent {
  dictionary = dictionary;
  cols: ICol[] = [
    {
      hasNormalRow: true,
      hidden: false,
      width: "auto",
      field: "createdTime",
      hasDateTimeRow: true,
      header: dictionary.CreatedTime,
    },
    {
      hasNormalRow: true,
      hidden: false,
      width: "auto",
      field: "state",
      header: dictionary.State,
    },
    {
      hasNormalRow: true,
      hidden: false,
      width: "auto",
      field: "reason",
      header: dictionary.Description,
    },
  ];

  @Input() isOpen = false;
  @Input() order: BuyOrder | undefined;
  @Input() stateLogs: BuyOrderStateLog[] = [];
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {}

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
