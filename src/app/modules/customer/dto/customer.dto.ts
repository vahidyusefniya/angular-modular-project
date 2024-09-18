import { CreditTransactionType } from "@app/proxy/proxy";

export class CreateCredit implements ICreateCredit {
  merchantId: number | undefined;
  customerMerchantId: number | undefined;
  currencyId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
}
export interface ICreateCredit {
  merchantId: number | undefined;
  customerMerchantId: number | undefined;
  currencyId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
}

export class CreateCharge implements ICreateCharge {
  merchantId: number | undefined;
  bankId: number | undefined;
  currencyId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
  receiverMerchantId: number | undefined;
}
export interface ICreateCharge {
  merchantId: number | undefined;
  receiverMerchantId: number | undefined;
  currencyId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
}

export class Settle implements ISettle {
  merchantId: number | undefined;
  customerMerchantId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
}
export interface ISettle {
  merchantId: number | undefined;
  customerMerchantId: number | undefined;
  amount: number | undefined;
  description?: string | undefined;
}

export class Withdraw implements IWithdraw {
  merchantId: number | undefined;
  customerMerchantId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
}
export interface IWithdraw {
  merchantId: number | undefined;
  customerMerchantId: number | undefined;
  amount: number | undefined;
  description: string | undefined;
}

export interface ICustomerDetailUrlParams {
  id: number;
  priceList: string;
  assignedPriceListId: number;
  customer: string;
  walletId: number;
  merchantBranchId: number;
}

export class SettleTransactionsFilterDto
  implements ISettleTransactionsFilterDto
{
  from: string | undefined;
  end: string | undefined;
  creditTransactionType: CreditTransactionType | null | undefined;

  init(data: ISettleTransactionsFilterDto): void {
    this.from = data.from;
    this.end = data.end;
    this.creditTransactionType = data.creditTransactionType;
  }
}
export interface ISettleTransactionsFilterDto {
  from?: string | undefined;
  end?: string | undefined;
  creditTransactionType: CreditTransactionType | null | undefined;
}

export interface ISettleTransactionsTags {
  beginTime: string;
  endTime: string;
  creditTransactionType: string;
}

export interface IWalletAndCredit {
  balanceWallet: number | undefined;
  balanceCredit: number | undefined;
  currencyId: number | undefined;
  currencyName: string | undefined;
  debt?: number | undefined;
  isForTest?: boolean;
}

export class CustomerFilterDto implements ICustomerFilterDto {
  priceListId: number | undefined;
  gatewayListId: number | undefined;
  saleManagerId: number | undefined;

  init(data: ICustomerFilterDto): void {
    this.priceListId = data.priceListId;
    this.gatewayListId = data.gatewayListId;
    this.saleManagerId = data.saleManagerId;
  }
}
export interface ICustomerFilterDto {
  priceListId: number | undefined;
  gatewayListId: number | undefined;
  saleManagerId: number | undefined;
}

export interface ICustomersTagFilter {
  priceListId: string;
  gatewayListId: string;
  saleManagerId: string;
}

export interface ITimezone {
  id: number;
  code: string;
  time_diff: string;
  time_diff_summer: string;
}

export interface ITab {
  label: string;
  routerLink: string;
  id: string;
  permission: string | undefined;
}

export class BranchPostPayInvoiceFilterDto
  implements IBranchPostPayInvoiceFilterDto
{
  branchId!: number;
  merchantId: number | undefined;
  beginTime: Date | undefined;
  endTime: Date | undefined;
  pageNumber: number | undefined;
  pageSize: number | undefined;

  init(data: IBranchPostPayInvoiceFilterDto): void {
    this.branchId = data.branchId;
    this.merchantId = data.merchantId;
    this.beginTime = data.beginTime;
    this.endTime = data.endTime;
    this.pageNumber = data.pageNumber;
    this.pageSize = data.pageSize;
  }
}
export interface IBranchPostPayInvoiceFilterDto {
  branchId: number;
  merchantId: number | undefined;
  beginTime: Date | undefined;
  endTime: Date | undefined;
  pageNumber: number | undefined;
  pageSize: number | undefined;
}
export interface IBranchPostPayInvoiceFilterDtoTag {
  beginTime: string | undefined;
  endTime: string | undefined;
}
