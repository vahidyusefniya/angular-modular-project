// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PriceList } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-customer-assign-price-list",
  templateUrl: "./assign-price-list.component.html",
  styleUrls: ["./assign-price-list.component.scss"],
})
export class AssignPriceListCustomerComponent implements OnInit {
  dictionary = dictionary;
  priceListId!: number;

  @Input() priceLists: PriceList[] = [];
  @Input() isOpen = false;
  @Input() title: string | undefined;
  @Input() assignedPriceListId: number | undefined;

  @Output() assignPriceList = new EventEmitter<{ id: number; name: string }>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.assignedPriceListId) this.priceListId = this.assignedPriceListId;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onAssignPriceListClick(): void {
    const name = this.priceLists.find(
      (p) => p.priceListId == this.priceListId,
    )?.priceListName;
    const data = {
      name: name!,
      id: this.priceListId,
    };
    this.assignPriceList.emit(data);
    this.modalCtrl.dismiss();
  }
}
