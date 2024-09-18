import { PaymentOrderType } from "@app/proxy/proxy";

export class PaymentOrderFilterRequestDto {
  beginTime?: Date | null | undefined;
  endTime?: Date | null | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  merchantId = 0;
  paymentOrderStates?: string | null | undefined;
  init(data: IPaymentOrderFilterRequestDto): void {
    this.merchantId = data.merchantId;
    this.paymentOrderStates = data.paymentOrderStates;
    this.beginTime = data.beginTime;
    this.endTime = data.endTime;
    this.pageNumber = data.pageNumber;
    this.pageSize = data.pageSize;
  }
}
export class IPaymentOrderFilterRequestDto {
  beginTime?: Date | null | undefined;
  endTime?: Date | null | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  merchantId = 0;
  paymentOrderStates?: string | null | undefined;
}

export interface IPaymentFilterTags {
  beginTime: Date | null | undefined;
  endTime: Date | null | undefined;
  paymentOrderStates: string
  paymentOrderType: string
}



export class PaymentFilterDtoDto implements IPaymentFilterDto {
  from: string | undefined;
  end: string | undefined;
  paymentOrderStates?: string | undefined;
  paymentOrderType?: PaymentOrderType
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  paymentOrderId: string | undefined;

  init(data: IPaymentFilterDto): void {
    this.from = data.from;
    this.end = data.end;
    this.paymentOrderStates = data.paymentOrderStates
    this.paymentOrderType = data.paymentOrderType
    this.pageNumber = data.pageNumber
    this.pageSize = data.pageSize
    this.paymentOrderId = data.paymentOrderId
  }
}
export interface IPaymentFilterDto {
  from: string | undefined;
  end: string | undefined;
  paymentOrderStates?: string | undefined;
  paymentOrderType?: PaymentOrderType
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  paymentOrderId: string | undefined;
}

export interface IPaymentTags {
  beginTime: string;
  endTime: string;
  paymentOrderStates: string
  paymentOrderType: string | null | undefined;
  paymentOrderId: string
}
