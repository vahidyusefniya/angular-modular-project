import { Injectable } from "@angular/core";
import {
  CategoryProduct,
  PlaceDigitalCardOrderRequest,
  PriceRangeDto,
} from "@app/proxy/shop-proxy";

@Injectable({
  providedIn: "root",
})
export class ShopService {
  order = new PlaceDigitalCardOrderRequest();

  constructor() {}

  searchCategory(
    element: CategoryProduct,
    id: number
  ): CategoryProduct | undefined {
    if (element.categoryId == id) {
      return element;
    } else if (element.categories != null) {
      let i;
      let result = undefined;
      for (i = 0; result == undefined && i < element.categories.length; i++) {
        result = this.searchCategory(element.categories[i], id);
      }
      return result;
    }
    return undefined;
  }

  getCalcStartValue(faceValue: PriceRangeDto): number {
    return (
      ((faceValue.faceValue * 100 - 100) / 100) * faceValue.start +
      faceValue.start
    );
  }
  getCalcEndValue(faceValue: PriceRangeDto): number | undefined {
    if (!faceValue.end) return undefined;
    return (
      ((faceValue.faceValue * 100 - 100) / 100) * faceValue.end + faceValue.end
    );
  }
  getCalcDiscountValue(faceValue: PriceRangeDto): number | undefined {
    return faceValue.faceValue * 100 - 100;
  }
  setOrder(order: PlaceDigitalCardOrderRequest): void {
    this.order = order;
  }
}
