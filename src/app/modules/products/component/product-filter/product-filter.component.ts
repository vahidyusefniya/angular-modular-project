import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { LoadingService } from "@app/core/services";
import {
  Category,
  CreateProductRequest,
  CurrenciesClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ProductFilterDto } from "../../dto/product.dto";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-product-filter",
  templateUrl: "./product-filter.component.html",
  styleUrls: ["./product-filter.component.scss"],
})
export class ProductFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new ProductFilterDto();
  @Input() data = new ProductFilterDto();
  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() filterProduct = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.filter.init({
      categoryId: this.data.categoryId,
      currencyId: this.data.currencyId,
    });
  }

  chooseCategory(category: Category): void {
    this.filter.categoryId = category.categoryId;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onFilterProductClick() {
    this.filterProduct.emit(this.filter);
    this.onDismiss();
  }

  removeCategory(){
    this.filter.categoryId = undefined;
  }
}
