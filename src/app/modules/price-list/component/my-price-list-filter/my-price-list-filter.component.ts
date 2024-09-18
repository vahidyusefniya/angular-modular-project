import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Category, CreateProductRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { IProductType, MyPriceListFilterDto } from "../../dto/price-list.dto";

@Component({
  selector: "app-my-price-list-filter",
  templateUrl: "./my-price-list-filter.component.html",
  styleUrls: ["./my-price-list-filter.component.scss"],
})
export class MyPriceListFilterComponent implements OnInit {
  dictionary = dictionary;
  label: string | undefined;
  selectedProductType: number | undefined;
  selectedCategoryName: string | undefined;
  openSelectCategoryModal = false;
  product = new CreateProductRequest();
  productTypes: IProductType[] = [
    {
      productTypeId: 1,
      productTypeName: dictionary.DigitalCards,
    },
    {
      productTypeId: 2,
      productTypeName: dictionary.PhysicalCards,
    },
  ];

  @Input() isOpen = false;
  @Input() data = new MyPriceListFilterDto();

  @Output() dismiss = new EventEmitter();
  @Output() FilterMyPriceList = new EventEmitter<MyPriceListFilterDto>();

  constructor(private modalCtrl: ModalController) { }

  ngOnInit(): void {
    if (typeof this.data.isPhysicalProduct === "boolean") {
      this.selectedProductType = this.data.isPhysicalProduct === false ? 1 : 2;
    } else {
      this.selectedProductType = undefined;
    }
  }
  onFilterClick(): void {
    if (this.selectedProductType) {
      this.data.isPhysicalProduct =
        this.selectedProductType === 1 ? false : true;
    }
    // this.data.categoryId = this.product.categoryId
    this.FilterMyPriceList.emit(this.data);
    this.modalCtrl.dismiss();
  }
  currencyChange(data: string): void {
    if (data === dictionary.Clear) {
      this.data.currencyId = undefined;
    }
  }
  productTypeChange(data: string): void {
    if (data === dictionary.Clear) {
      this.data.isPhysicalProduct = undefined;
    }
  }

  chooseCategory(category: Category): void {
    this.data.categoryId = category.categoryId
    // this.product.categoryId = category.categoryId;
    // this.selectedCategoryName = category.categoryName;
  }

  onDismiss(): void {
    this.dismiss.emit();
    this.modalCtrl.dismiss();
  }

  removeCategory(){
    this.data.categoryId = undefined;
  }
}
