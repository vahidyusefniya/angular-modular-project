export class CreateBranchRequest implements ICreateBranchRequest {
  branchId: number | undefined;
  branchName: string | undefined;
  description: string | undefined;

  init(data: ICreateBranchRequest): void {
    this.branchId = data.branchId;
    this.branchName = data.branchName;
    this.description = data.description;
  }
}
export interface ICreateBranchRequest {
  branchId: number | undefined;
  branchName: string | undefined;
  description: string | undefined;
}
