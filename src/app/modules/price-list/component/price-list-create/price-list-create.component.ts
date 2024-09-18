// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CreatePriceListRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-price-list-create",
  templateUrl: "./price-list-create.component.html",
  styleUrls: ["./price-list-create.component.scss"],
})
export class PriceListCreateComponent {
  dictionary = dictionary;
  priceList = new CreatePriceListRequest();

  @Input() isOpen = false;

  @Output() newPriceList = new EventEmitter<CreatePriceListRequest>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onNewPriceListClick(): void {
    this.modalCtrl.dismiss();
    this.newPriceList.emit(this.priceList);
  }
}
