export interface IAccountNumber {
  paymentMethodProviderProfileId?: number | undefined;
  paymentMethodNumber?: string | undefined;
}

export class PostPaidFilterDtoDto implements IPostPaidFilterDto {
  from: string | undefined;
  end: string | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;

  init(data: IPostPaidFilterDto): void {
    this.from = data.from;
    this.end = data.end;
    this.pageNumber = data.pageNumber
    this.pageSize = data.pageSize
  }
}
export interface IPostPaidFilterDto {
  from: string | undefined;
  end: string | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}

export interface IPostPaidTags {
  beginTime: string;
  endTime: string;
}
