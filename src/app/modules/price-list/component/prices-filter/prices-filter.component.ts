import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Category, CreateProductRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { IProductType } from "../../dto/price-list.dto";

@Component({
  selector: "app-prices-filter",
  templateUrl: "./prices-filter.component.html",
  styleUrls: ["./prices-filter.component.scss"],
})
export class PricesFilterComponent implements OnInit {
  dictionary = dictionary;
  label: string | undefined;
  currencyId: number | undefined;
  productTypeId: string | undefined;
  openSelectCategoryModal = false;
  product = new CreateProductRequest();
  categoryName: string | undefined;
  categoryId: number | undefined;

  @Input() isOpen = false;
  @Input() selectedCurrency: number | undefined;
  @Input() selectedProductType: boolean | undefined | null;
  @Input() selectedCategoryName: string | undefined;
  @Input() selectedCategoryId: number | undefined;
  @Input() productTypes: IProductType[] = [
    {
      productTypeId: 1,
      productTypeName: dictionary.DigitalCards,
    },
    {
      productTypeId: 2,
      productTypeName: dictionary.PhysicalCards,
    },
  ];

  @Output() dismiss = new EventEmitter();
  @Output() FilterPrices = new EventEmitter();

  constructor(private modalCtrl: ModalController) { }

  ngOnInit(): void {
    if (this.selectedCurrency) {
      this.currencyId = this.selectedCurrency;
    }
    if (this.selectedCategoryName && this.selectedCategoryId) {
      this.categoryName = this.selectedCategoryName;
      this.categoryId = this.selectedCategoryId
    }
    if (
      String(this.selectedProductType) !== "undefined" &&
      String(this.selectedProductType) !== "null"
    ) {
      this.productTypeId = this.selectedProductType
        ? dictionary.PhysicalCards
        : dictionary.DigitalCards;
    } else {
      this.productTypeId = undefined;
    }
  }
  onFilterClick(): void {
    this.FilterPrices.emit({
      currencyId: this.currencyId,
      category: { categoryId: this.categoryId, categoryName: this.categoryName },
      // categoryId: this.product.categoryId,
      productType: !this.productTypeId
        ? null
        : this.productTypeId === dictionary.PhysicalCards
          ? true
          : false,
    });
    this.modalCtrl.dismiss();
  }
  currencyChange(data: string): void {
    if (data === dictionary.Clear) {
      this.currencyId = undefined;
    }
  }
  productTypeChange(data: string): void {
    if (data === dictionary.Clear) {
      this.productTypeId = undefined;
    }
  }

  chooseCategory(category: Category): void {
    // this.categoryId = category.categoryId;
    this.categoryName = category.categoryName;
    this.categoryId = category.categoryId;
  }

  onDismiss(): void {
    this.dismiss.emit();
    // noinspection JSIgnoredPromiseFromCall
    this.modalCtrl.dismiss();
  }

  removeCategory(){
    this.categoryId = undefined;
  }
}
