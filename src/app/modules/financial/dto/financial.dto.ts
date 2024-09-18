import { FinancialOrderState, FinancialOrderType } from "@app/proxy/proxy";

export class WalletOrdersFilterDto implements IWalletOrdersFilterDto {
  walletOrderType: FinancialOrderType | undefined;
  customerMerchantId: number | undefined;
  walletOrderState?: FinancialOrderState | null | undefined;
  from: string | undefined;
  end: string | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;

  init(data: IWalletOrdersFilterDto): void {
    this.walletOrderType = data.walletOrderType;
    this.customerMerchantId = data.customerMerchantId;
    this.walletOrderState = data.walletOrderState;
    this.end = data.end;
    this.from = data.from;
    this.pageNumber = data.pageNumber;
    this.pageSize = data.pageSize;
  }
}

export interface IWalletOrdersFilterDto {
  walletOrderType: FinancialOrderType | undefined;
  customerMerchantId: number | undefined;
  walletOrderState?: FinancialOrderState | null | undefined;
  from: string | undefined;
  end: string | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}

export interface IWalletOrdersTags {
  walletOrderType: string | undefined;
  customerMerchantId?: number | null | undefined;
  walletOrderState?: string | null | undefined;
  from: string | undefined;
  end: string | undefined;
}
