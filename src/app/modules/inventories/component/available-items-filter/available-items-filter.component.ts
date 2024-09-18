// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { Product, ProductSummary } from "@proxy/proxy";
import { AvailableItemsFilterDto } from "../../dto/Inventories.dto";

@Component({
  selector: "app-available-items-filter",
  templateUrl: "./available-items-filter.component.html",
  styleUrls: ["./available-items-filter.component.scss"],
})
export class AvailableItemsFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new AvailableItemsFilterDto();
  maxDate = new Date().toISOString();
  openProductSearchModal = false;
  currencyName: string | undefined;

  @Input() searchProductLoading = false;
  @Input() products: ProductSummary[] = [];
  @Input() data: AvailableItemsFilterDto | undefined;
  @Input() isOpen = false;
  @Input() productName: string | undefined;

  @Output() filterClick = new EventEmitter<AvailableItemsFilterDto>();
  @Output() dismiss = new EventEmitter();
  @Output() searchEvent = new EventEmitter<string>();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data) this.filter.init(this.data);
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  selectSearchProductModal(product: Product) {
    this.filter.productId = product.productId;
    this.productName = product.productName;
  }
  onClearSelectedProduct(): void {
    this.filter.productId = undefined;
    this.productName = undefined;
  }

  onFilterClick(): void {
    this.filterClick.emit(this.filter);
    this.modalCtrl.dismiss();
  }

  dismissProductSearchModal() {
    this.openProductSearchModal = false;
    this.searchEvent.emit("");
  }

  searchProduct(event: any) {
    this.searchEvent.emit(event);
  }
}
