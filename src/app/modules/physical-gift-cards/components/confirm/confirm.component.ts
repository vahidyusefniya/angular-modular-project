// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PhysicalCardActivation } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-confirm",
  templateUrl: "./confirm.component.html",
  styleUrls: ["./confirm.component.scss"],
})
export class ConfirmComponent implements OnInit {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  
  cols: any[] = [
    {
      field: "imageUrl",
      header: dictionary.Avatar,
    },
    {
      field: "productName",
      header: dictionary.Title,
    },
    {
      field: "unitFaceValuePrice",
      header: dictionary.UnitFaceValuePrice,
    },
    {
      field: "unitBuyPrice",
      header: dictionary.UnitBuyPrice,
    }
  ];

  @Input() isOpen = false;
  @Input() faceValuePrice = 0;
  @Input() unitPrice = 0;
  @Input() product: PhysicalCardActivation | undefined
  @Input() products: any[] = []
  @Output() dismiss = new EventEmitter();
  @Output() confirm = new EventEmitter();
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
    this.modalCtrl.dismiss();
  }

  onCheckoutClick(): void {
    this.confirm.emit()
    this.modalCtrl.dismiss();
  }
}
