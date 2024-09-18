

export class PhysicalCardOrdersFilterDto implements IPhysicalCardOrdersFilterDto {
  physicalCardOrderState?: string | null | undefined;
  subMerchantId?: string | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  from: string | undefined;
  end: string | undefined;

  init(data: IPhysicalCardOrdersFilterDto): void {
    this.physicalCardOrderState = data.physicalCardOrderState;
    this.subMerchantId = data.subMerchantId;
    this.pageNumber = data.pageNumber;
    this.pageSize = data.pageSize;
    this.from = data.from;
    this.end = data.end;
  }
}
export interface IPhysicalCardOrdersFilterDto {
  physicalCardOrderState?: string | null | undefined;
  subMerchantId?: string | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
  from?: string | undefined;
  end?: string | undefined;
}

export interface IPhysicalCardOrdersTags {
  physicalCardOrderState: string;
  subMerchantId: string;
  beginTime: string;
  endTime: string;
}
