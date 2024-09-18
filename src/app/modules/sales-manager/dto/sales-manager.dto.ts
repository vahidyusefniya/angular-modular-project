import {dictionary} from "@dictionary/dictionary";

export class SalesManagerDto implements ISalesManagerDto {
  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  status: string | undefined;
}
export interface ISalesManagerDto {
  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  status: string | undefined;
}
export interface ISaleManagerFilterDto {
  isActive: boolean | undefined
}

export interface IReportFilterDto {
  from?: string | undefined;
  end?: string | undefined;
}

export class SaleManagerFilterDto implements ISaleManagerFilterDto {
  isActive: boolean | undefined;
  init(data: ISaleManagerFilterDto) {
    this.isActive = data?.isActive;
  }
}

export type DateTimeRange =
  | dictionary.CurrentMonth
  | dictionary.Custom
  | string;

export class ReportFilterDto implements IReportFilterDto {
  from: string | undefined;
  end: string | undefined;

  init(data: IReportFilterDto): void {
    this.from = data.from;
    this.end = data.end;
  }
}