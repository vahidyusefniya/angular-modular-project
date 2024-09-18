// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Product, ProductSummary } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "product-search",
  templateUrl: "./product-search.component.html",
  styleUrls: ["./product-search.component.scss"],
})
export class ProductSearchComponent implements OnInit {
  dictionary = dictionary;

  @Input() products: ProductSummary[] = [];
  @Input() searchProductLoading = false;
  @Input() isOpen = false;

  @Output() dismissProductModal = new EventEmitter();
  @Output() select = new EventEmitter<Product>();
  @Output() searchEvent = new EventEmitter<string>();
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismissProductModal.emit();
  }
  searchProduct(event: any) {
    this.searchEvent.emit(event.target.value);
  }

  selectProduct(product: Product) {
    this.select.emit(product);
    this.onDismiss();
  }
}
