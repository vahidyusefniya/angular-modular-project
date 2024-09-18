import { Currency } from "@app/proxy/shop-proxy";

export interface IButtonFaceValue {
  id: number;
  start: number | undefined;
  end: number | null;
  endValue: number | undefined;
  isEndless: boolean | undefined;
  faceValue: number | undefined;
  fill: Fill;
  currency: Currency;
}

type Fill = "outline" | "solid";

export class ActivateDto implements IActivateDto {
  serialNumber!: string;
  productPrice = 0;
  withExchange = true;
  buyPrice = 0;
  unitFaceValuePrice?: number;
  currency?: Currency;
  unitBuyPrice?: number;
  totalPrice?: number;

  init(data: IActivateDto) {
    this.serialNumber = data.serialNumber;
    this.productPrice = data.productPrice;
    this.withExchange = data.withExchange;
    this.buyPrice = data.buyPrice;
    this.unitFaceValuePrice = data.unitFaceValuePrice;
    this.currency = data.currency;
    this.unitBuyPrice = data.unitBuyPrice;
    this.totalPrice = data.totalPrice;
  }
}
export interface IActivateDto {
  serialNumber: string;
  productPrice: number;
  withExchange: boolean;
  buyPrice: number;
  unitFaceValuePrice?: number;
  currency?: Currency;
  unitBuyPrice?: number;
  totalPrice?: number;
}
