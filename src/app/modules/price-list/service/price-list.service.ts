import { Injectable } from "@angular/core";
import { CoreService } from "@app/core/services";
import { Category, Price, PriceResult } from "@app/proxy/proxy";

@Injectable({
  providedIn: "root",
})
export class PriceListService {
  constructor(private coreService: CoreService) {}
  getMaxAndMinPriceRange(data: PriceResult[], price?: Price): string {
    let textPriceRange: string;
    if (data.length > 1) {
      let maxPrice = Math.max(
        ...data.map((price) => price.rule.faceValue.end!)
      );
      let minPrice = Math.min(
        ...data.map((price) => price.rule.faceValue.start!)
      );
      textPriceRange = `${
        price?.currency.symbol ? price?.currency.symbol : ""
      }${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " +
              `${price?.currency.symbol ? price?.currency.symbol : ""}` +
              this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textPriceRange = `${
        price?.currency.symbol ? price.currency.symbol : ""
      }${this.coreService.numberWithCommas(data[0].rule!.faceValue.start)} ${
        data[0].rule!.faceValue.end! !== null
          ? this.coreService.isUnlimitedNumber(data[0].rule!.faceValue.end!)
            ? "- ထ"
            : "- " +
              `${price?.currency.symbol ? price?.currency.symbol : ""}` +
              this.coreService.numberWithCommas(data[0].rule!.faceValue.end!)
          : ""
      }`;
    }
    return textPriceRange;
  }
  getMaxAndMinBuyingPrice(data: PriceResult[], price: Price): string {
    let textBuyingPrice: string;
    if (data.length > 1) {
      let maxPrice = Math.max(
        ...data.map((price) => price.buyingPriceAmount?.end!)
      );
      let minPrice = Math.min(
        ...data.map((price) => price.buyingPriceAmount?.start!)
      );
      textBuyingPrice = `${
        price.currency.symbol ? price.currency.symbol : ""
      }${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " +
              `${price.currency.symbol ? price.currency.symbol : ""}` +
              this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textBuyingPrice = `${
        price.currency.symbol ? price.currency.symbol : ""
      }${this.coreService.numberWithCommas(
        data[0].buyingPriceAmount?.start!
      )} ${
        data[0].buyingPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(data[0].buyingPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              `${price.currency.symbol ? price.currency.symbol : ""}` +
              this.coreService.numberWithCommas(data[0].buyingPriceAmount?.end!)
          : ""
      }`;
    }
    return textBuyingPrice;
  }

  getMaxAndMinSellingPrice(data: PriceResult[], price: Price): string {
    let textSellingPrice: string;
    if (data.length > 1) {
      let maxPrice = Math.max(
        ...data.map((price) => price.resellPriceAmount?.end!)
      );
      let minPrice = Math.min(
        ...data.map((price) => price.resellPriceAmount?.start!)
      );
      textSellingPrice = `${
        price.currency.symbol ? price.currency.symbol : ""
      }${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " +
              `${price.currency.symbol ? price.currency.symbol : ""}` +
              this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textSellingPrice = `${
        price.currency.symbol ? price.currency.symbol : ""
      }${this.coreService.numberWithCommas(
        data[0].resellPriceAmount?.start!
      )} ${
        data[0].resellPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(data[0].resellPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              `${price.currency.symbol ? price.currency.symbol : ""}` +
              this.coreService.numberWithCommas(data[0].resellPriceAmount?.end!)
          : ""
      }`;
    }
    return textSellingPrice;
  }

  searchCategory(element: Category, id: number): Category | undefined {
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
}
