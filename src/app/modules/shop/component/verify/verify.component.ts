// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { DeliveryType, ProductShopDto } from "../../dto/shop.dto";
import { PlaceDigitalCardOrderRequest } from "@app/proxy/shop-proxy";

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.scss"],
})
export class VerifyComponent implements OnInit {
  dictionary = dictionary;
  products: ProductShopDto[] = [];
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  createOrder = new PlaceDigitalCardOrderRequest();
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
    },
    {
      field: "quantity",
      header: dictionary.Quantity,
    },
    {
      field: "totalBuyPrice",
      header: dictionary.TotalBuyPrice,
    },
  ];

  @Input() isOpen = false;
  @Input() product!: ProductShopDto;
  @Input() quantity!: number;
  @Input() email: string | undefined;
  @Input() deliveryType: string = "download";
  @Input() faceValuePrice = 0;
  @Input() unitPrice = 0;
  @Input() totalPrice = 0;
  @Input() deliveryTypeValue: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() verify = new EventEmitter<PlaceDigitalCardOrderRequest>();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.products.push(this.product);
  }

  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
    this.modalCtrl.dismiss();
  }

  onCheckoutClick(): void {
    this.modalCtrl.dismiss();
    this.createOrder.init({
      productId: this.product.productId,
      productPrice: this.faceValuePrice,
      quantity: this.quantity,
      buyPrice: this.unitPrice,
      deliveryTypeValue: this.deliveryTypeValue,
      deliveryType: this.deliveryType == "Download" ? null : this.deliveryType,
    });
    this.verify.emit(this.createOrder);
  }
}
