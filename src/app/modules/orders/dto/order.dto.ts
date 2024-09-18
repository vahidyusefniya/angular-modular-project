// noinspection DuplicatedCode

export class OrderFilterDto implements IOrderFilterDto {
  customer: number | undefined;
  from: string | undefined;
  end: string | undefined;

  init(data: IOrderFilterDto): void {
    this.customer = data.customer;
    this.from = data.from;
    this.end = data.end;
  }
}
export interface IOrderFilterDto {
  customer: number | undefined;
  from?: string | undefined;
  end?: string | undefined;
}
export class OrderFilterRequestDto implements IOrderFilterRequestDto {
  branchId: number = 0;
  beginTime: Date | null | undefined;
  endTime: Date | null | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}
export interface IOrderFilterRequestDto {
  branchId: number;
  beginTime: Date | null | undefined;
  endTime: Date | null | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}

export class MerchantDto implements IMerchantDto {
  merchantId: number | undefined;
  merchantName: string | undefined;
  digitalCustomText: string | undefined;
  digitalCustomTextPos: string | undefined;
  cryptoCustomText: string | undefined;
  cryptoCustomTextPos: string | undefined;
  physicalCustomTextPos: string | undefined;
  logo: any;
  logoPos: any;
  isConditionAccepted: boolean | undefined;
  externalReference: string | undefined;
  description: string | undefined;
  updatedTime: Date | undefined;
  createdTime: Date | undefined;
  isActive: boolean | undefined;
  parentBranchId: any;
}
export interface IMerchantDto {
  merchantId: number | undefined;
  merchantName: string | undefined;
  digitalCustomText: string | undefined;
  digitalCustomTextPos: string | undefined;
  cryptoCustomText: string | undefined;
  cryptoCustomTextPos: string | undefined;
  physicalCustomTextPos: string | undefined;
  logo: any;
  logoPos: any;
  isConditionAccepted: boolean | undefined;
  externalReference: string | undefined;
  description: string | undefined;
  updatedTime: Date | undefined;
  createdTime: Date | undefined;
  isActive: boolean | undefined;
  parentBranchId: any;
}

export interface IOrderTags {
  customer: string;
  beginTime: string;
  endTime: string;
}
