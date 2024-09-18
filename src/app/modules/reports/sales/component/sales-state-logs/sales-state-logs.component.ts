// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { BuyOrder, BuyOrderStateLog } from "@app/proxy/shop-proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-sales-state-logs",
  templateUrl: "./sales-state-logs.component.html",
  styleUrls: ["./sales-state-logs.component.scss"],
})
export class SalesStateLogsComponent implements OnInit {
  dictionary = dictionary;
  @Input() isOpen = false;
  @Input() stateLogs: BuyOrderStateLog[] = [];
  @Input() order: BuyOrder | undefined;
  @Output() dismiss = new EventEmitter();
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
  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {}

  ngOnInit() {}

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
