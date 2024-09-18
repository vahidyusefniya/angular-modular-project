
export interface IReturnOrderFilterDto {
  from?: string | undefined;
  end?: string | undefined;
}

export class ReturnOrderFilterDto implements IReturnOrderFilterDto {
  from: string | undefined;
  end: string | undefined;

  init(data: IReturnOrderFilterDto): void {
    this.from = data.from;
    this.end = data.end;
  }
}