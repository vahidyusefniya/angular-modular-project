export class ProductItemOrderFilterRequestDto {
  beginTime: Date | null | undefined;
  endTime: Date | null | undefined;
  productId: number | null | undefined;
  currencyId: number | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}

export interface IProductItemOrderFilterRequestDto {
  from: string | undefined;
  end: string | undefined;
  productId: number | null | undefined;
  currencyId: number | undefined;
}

export class ProductItemOrderFilterDto
  implements IProductItemOrderFilterRequestDto
{
  from: string | undefined;
  end: string | undefined;
  productId: number | null | undefined;
  currencyId: number | undefined;
  init(data: ProductItemOrderFilterDto): void {
    this.from = data.from;
    this.end = data.end;
    this.productId = data.productId;
    this.currencyId = data.currencyId;
  }
}

export interface IProductItemOrderTags {
  beginTime: string;
  endTime: string;
  productId: string;
  currencyId: string;
}

export class AvailableItemsFilterRequestDto {
  productId: number | null | undefined;
  currencyId: number | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}

export interface IAvailableItemsFilterRequestDto {
  productId: number | null | undefined;
  currencyId: number | undefined;
}

export class AvailableItemsFilterDto
  implements IAvailableItemsFilterRequestDto
{
  productId: number | null | undefined;
  currencyId: number | undefined;
  init(data: AvailableItemsFilterDto): void {
    this.productId = data.productId;
    this.currencyId = data.currencyId;
  }
}

export interface IAvailableItemsTags {
  productId: string;
  currencyId: string;
}
