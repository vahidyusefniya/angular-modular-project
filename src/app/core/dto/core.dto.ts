export class ResponseErrorDto implements IResponseErrorDto {
  type: string | undefined;
  message: string | undefined;
  typeName: string | undefined;
  status: Number | undefined;

  init(data: IResponseErrorDto): void {
    this.type = data.type;
    this.message = data.message;
    this.typeName = data.typeName;
    this.status = data.status;
  }
}
interface IResponseErrorDto {
  type: string | undefined;
  message: string | undefined;
  typeName: string | undefined;
  status: Number | undefined;
}
