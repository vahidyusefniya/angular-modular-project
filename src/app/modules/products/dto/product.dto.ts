export class ProviderDto implements IProviderDto {
  providerName: string | undefined;
  providerId: number | undefined;
}

export interface IProviderDto {
  providerName: string | undefined;
  providerId: number | undefined;
}

export class ProductFilterDto implements IProductFilterDto {
  categoryId: number | undefined;
  currencyId: number | undefined;

  init(data: IProductFilterDto): void {
    this.categoryId = data.categoryId;
    this.currencyId = data.currencyId;
  }
}

export interface IProductFilterDto {
  categoryId: number | undefined;
  currencyId: number | undefined;
}

export interface IProductsTagFilter {
  currencyId: string;
  categoryId: string;
}
