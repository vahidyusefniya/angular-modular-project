// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { Currency, Product, ProductSummary } from "@proxy/proxy";
import { ProductItemOrderFilterDto } from "../../dto/Inventories.dto";

@Component({
  selector: "app-product-item-order-filter",
  templateUrl: "./product-item-order-filter.component.html",
  styleUrls: ["./product-item-order-filter.component.scss"],
})
export class ProductItemOrderFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new ProductItemOrderFilterDto();
  maxDate = new Date().toISOString();
  openProductSearchModal = false;
  currencyName: string | undefined;

  @Input() searchProductLoading = false;
  @Input() products: ProductSummary[] = [];
  @Input() data: ProductItemOrderFilterDto | undefined;
  @Input() isOpen = false;
  @Input() productName: string | undefined;

  @Output() filterClick = new EventEmitter<ProductItemOrderFilterDto>();
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

  onFilterClick(): void {
    if (this.filter.end) {
      this.filter.end = CoreService.getUtcDateTimeForFilterDatePicker(
        this.filter.end
      );
    }
    if (this.filter.from) {
      this.filter.from = CoreService.getUtcDateTimeForFilterDatePicker(
        this.filter.from
      );
    }
    this.filterClick.emit(this.filter);
    this.modalCtrl.dismiss();
  }

  searchProduct(event: any) {
    this.searchEvent.emit(event);
  }
}
