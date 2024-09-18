import { PosOrderState } from "@app/proxy/proxy";

export class PosOrdersFilterDto implements IPosOrdersFilterDto {
  posOrderState?: PosOrderState | null | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  subMerchantId?: number | undefined;

  init(data: IPosOrdersFilterDto): void {
    this.posOrderState = data.posOrderState;
    this.subMerchantId = data.subMerchantId;
    this.pageNumber = data.pageNumber;
    this.pageSize = data.pageSize;
  }
}
export interface IPosOrdersFilterDto {
  posOrderState?: PosOrderState | null | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  subMerchantId?: number | undefined;
}

export interface IPosOrdersTags {
  posOrderState?: string | null | undefined;
  subMerchantId?: number | undefined;
}

export interface IAccountNumber {
  paymentMethodProviderProfileId?: number | undefined;
  paymentMethodNumber?: string | undefined;
}

export const InprogressStates = "1,3,4,8,9";
