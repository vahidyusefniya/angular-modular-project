
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
  merchantId: string | undefined;
}
