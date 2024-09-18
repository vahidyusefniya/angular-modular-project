import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ProductShopDto } from "@app/modules/shop/dto/shop.dto";
import { ShopService } from "@app/modules/shop/service/shop.service";
import { PriceRangeDto } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-product-card",
  templateUrl: "./product-card.component.html",
  styleUrls: ["./product-card.component.scss"],
})
export class ProductCardComponent {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  price = 1500000;
  favorite = false;

  @Output() cardClick = new EventEmitter();

  @Input() product!: ProductShopDto;
  @Input() id: number = 0;
  @Input() showFavorite = true;
  @Input() color: "dark" | "light" = "light";

  constructor(private shopService: ShopService) {}

  getCalcStartValue(faceValue: PriceRangeDto): number {
    return this.shopService.getCalcStartValue(faceValue);
  }
  getCalcEndValue(faceValue: PriceRangeDto): number | undefined {
    if (!faceValue.end) return undefined;
    return this.shopService.getCalcEndValue(faceValue);
  }
  getCalcDiscountValue(faceValue: PriceRangeDto): number | undefined {
    return this.shopService.getCalcDiscountValue(faceValue);
  }

  onCardClick(product: ProductShopDto): void {
    this.cardClick.emit(product);
  }

  onFavoriteClick(event: Event): void {
    event.stopImmediatePropagation();
    this.favorite = !this.favorite;
  }
}
