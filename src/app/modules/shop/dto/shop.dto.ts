// noinspection SpellCheckingInspection

import { PriceRange } from "@app/proxy/proxy";
import { Currency } from "@app/proxy/shop-proxy";
import { PriceRangeDto } from "@app/proxy/shop-proxy";

export class ShopState implements IShopState {
  current: any[] = [];
  previous: Array<IPrevious> = [];
  shopCardType: ShopCardType = "category";
}
export interface IShopState {
  current: any[];
  previous: Array<IPrevious>;
  shopCardType: ShopCardType;
}
export interface IPrevious {
  data: any[];
  shopCardType: ShopCardType;
}

export type ShopCardType = "category" | "product";
export type DeliveryType = "whatsApp" | "sms" | "email" | "download";

export class Checkout implements ICheckout {
  product: ProductShopDto | undefined;
  type: string | null = null;
  faceValuePrice: number | undefined;
  unitPrice: number | undefined;
  totalPrice: number | undefined;
  quantity: number | undefined;
  deliveryTypeValue: string | null = null;
  email?: string;
}
export interface ICheckout {
  product: ProductShopDto | undefined;
  type: string | null;
  faceValuePrice: number | undefined;
  unitPrice: number | undefined;
  totalPrice: number | undefined;
  deliveryTypeValue: string | null;
  email?: string;
}

export interface IDescirption {
  title: string;
  description: string;
  type: string;
}

export class ProductShopDto implements IProductShopDto {
  productId: number | undefined;
  productName: string | undefined;
  imageUrl: string | undefined;
  currency!: Currency;
  faceValue: PriceRangeDto = {
    faceValue: 0,
    start: 0,
    end: 0,
    endValue: 0,
    isEndless: false,
    consumerFee:0,
    consumerTax:0,
    init: () => {},
    toJSON: () => {},
  };
  hasDescription: boolean | undefined;
  upc?: string | undefined;
}
export interface IProductShopDto {
  productId: number | undefined;
  productName: string | undefined;
  imageUrl: string | undefined;
  currency: Currency;
  faceValue: PriceRange;
  hasDescription: boolean | undefined;
  upc?: string | undefined;
}

export type BasketProductShopDto = IProductShopDto & { quantity: number };