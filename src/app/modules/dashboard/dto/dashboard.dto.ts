import { dictionary } from "@dictionary/dictionary";

export class CustomDateFilterDto implements ICustomDateFilterDto {
  beginTime?: string | undefined;
  endTime?: string | undefined;

  init(data: ICustomDateFilterDto): void {
    this.beginTime = data.beginTime;
    this.endTime = data.endTime;
  }
}
export interface ICustomDateFilterDto {
  beginTime?: string | undefined;
  endTime?: string | undefined;
}

export class ReportFilterDto implements IReportFilterDto {
  branchId!: number;
  beginTime: Date | undefined;
  endTime: Date | undefined;

  init(data: IReportFilterDto): void {
    this.branchId = data.branchId;
    this.beginTime = data.beginTime;
    this.endTime = data.endTime;
  }
}
export interface IReportFilterDto {
  branchId: number;
  beginTime: Date | undefined;
  endTime: Date | undefined;
}

export class CustomersDebtDto implements ICustomersDebtDto {
  name: string | undefined;
  amount: number | undefined;
}
export interface ICustomersDebtDto {
  name: string | undefined;
  amount: number | undefined;
}

export class DashboardListDto implements IDashboardListDto {
  name: string | undefined;
  sales: number | undefined;
  profit: number | undefined;
}
export interface IDashboardListDto {
  name: string | undefined;
  sales: number | undefined;
  profit: number | undefined;
}
export class CustomerDto extends DashboardListDto {}
export class SaleManagerDto extends DashboardListDto {}
export class OfficeDto extends DashboardListDto {}
export class TopTenItemDto extends DashboardListDto {}

export class FilterDateRangeDto implements IFilterDateRangeDto {
  start = new Date();
  end = new Date();

  init(data: IFilterDateRangeDto): void {
    this.start = data.start;
    this.end = data.end;
  }
}
export interface IFilterDateRangeDto {
  start: Date;
  end: Date;
}

export type DateRangeType = "Today" | "CurrentMonth" | "Custom" | string;
