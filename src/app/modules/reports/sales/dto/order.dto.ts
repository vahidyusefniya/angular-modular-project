export class OrderFilterDto implements IOrderFilterDto {
  customer: number | undefined;
  from: string | undefined;
  end: string | undefined;
  searchCriteria: string | undefined;
  currency: number | null | undefined;
  buyOrderStates: string | undefined;

  init(data: IOrderFilterDto): void {
    this.customer = data.customer;
    this.from = data.from;
    this.end = data.end;
    this.searchCriteria = data.searchCriteria;
    this.currency = data.currency;
    this.buyOrderStates = data.buyOrderStates;
  }
}
export interface IOrderFilterDto {
  customer: number | undefined;
  from?: string | undefined;
  end?: string | undefined;
  searchCriteria?: string | undefined;
  currency?: number | null | undefined;
  buyOrderStates: string | undefined;
}

export interface IOrderTags {
  customer: string;
  beginTime: string;
  endTime: string;
  currency: string;
  buyOrderStates: string;
}
