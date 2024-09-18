import { BuyOrderDeliveryType } from "@app/proxy/proxy";

export class BuysFilterDto implements IBuysFilterDto {
  from: string | undefined;
  end: string | undefined;
  currencyId: number | undefined;
  buyOrderStates: string | undefined;

  init(data: IBuysFilterDto): void {
    this.from = data.from;
    this.end = data.end;
    this.currencyId = data.currencyId;
    this.buyOrderStates = data.buyOrderStates;
  }
}
export interface IBuysFilterDto {
  from?: string | undefined;
  end?: string | undefined;
  currencyId: number | undefined;
  buyOrderStates: string | undefined;
}

export interface IBuysTags {
  currencyId: string;
  beginTime: string;
  endTime: string;
  buyOrderStates: string | undefined;
}
export const buyOrderStatesPending = "0,1,2,3,6,7,8,9";

export class ResendDto implements IResendDto {
  deliveryType: BuyOrderDeliveryType | undefined;
  email: string | undefined;

  init(data: IResendDto): void {
    this.deliveryType = data.deliveryType;
    this.email = data.email;
  }
}
export interface IResendDto {
  deliveryType: BuyOrderDeliveryType | undefined;
  email: string | undefined;
}
