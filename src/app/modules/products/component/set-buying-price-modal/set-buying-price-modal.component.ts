import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-set-buying-price-modal",
  templateUrl: "./set-buying-price-modal.component.html",
  styleUrls: ["./set-buying-price-modal.component.scss"],
})
export class SetBuyingPriceModalComponent {
  dictionary = dictionary;

  @Input() isOpen = false;
  @Input() id: number | undefined;
  @Input() branchId: number | undefined;

  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
