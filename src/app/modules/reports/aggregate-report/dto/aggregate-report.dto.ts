export class AggregateReportFilterDto implements IAggregateReportFilterDto {
  from: string | undefined;
  end: string | undefined;

  init(data: IAggregateReportFilterDto): void {
    this.from = data.from;
    this.end = data.end;
  }
}

export interface IAggregateReportFilterDto {
  from?: string | undefined;
  end?: string | undefined;
}
