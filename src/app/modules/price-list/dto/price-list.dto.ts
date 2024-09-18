import { Price, PriceRange, PriceRule, PriceRuleError } from "@app/proxy/proxy";

export interface IFaceValue {
  start: number | undefined;
  end: number | null;
}

export interface IPermission {
  canSetPriceModeToFaceValue: any;
  minMinBenefit: any;
  maxConsumerFee: any;
  maxConsumerTax: any;
}

export enum PriceValueMode {
  // noinspection JSUnusedGlobalSymbols
  FaceValue = 0,
  BuyValue = 1,
}

export class PriceDto implements IPriceDto {
  productId: number | undefined;
  productName: string | undefined;
  rules: IRule[] = [];

  init(data: IPriceDto): void {
    this.rules = data.rules;
    this.productName = data.productName;
    this.productId = data.productId;
  }
}
export interface IPriceDto {
  productId: number | undefined;
  productName: string | undefined;
  rules: IRule[];
}

export class RuleDto implements IRule {
  id: number | undefined;
  faceValue: IFaceValue = {
    start: 0,
    end: null,
  };
  permission: IPermission = {
    canSetPriceModeToFaceValue: null,
    minMinBenefit: null,
    maxConsumerFee: null,
    maxConsumerTax: null,
  };
  priceValueMode = PriceValueMode.FaceValue;
  priceValue: number | undefined;
  step: number | undefined | null = null;
  minBenefit: number | undefined | null;
  consumerTax: number | undefined | null;
  consumerFee: number | undefined | null;
  isActive = false;

  init(data: IRule): void {
    this.faceValue = data.faceValue!;
    this.permission = data.permission!;
    this.priceValueMode = data.priceValueMode!;
    this.priceValue = data.priceValue;
    this.step = data.step;
    this.minBenefit = data.minBenefit;
    this.consumerTax = data.consumerTax;
    this.consumerFee = data.consumerFee;
    this.isActive = data.isActive;
  }
}
export interface IRule {
  id: number | undefined;
  faceValue: any;
  priceValueMode: PriceValueMode;
  priceValue: number | undefined;
  step: number | undefined | null;
  minBenefit: number | undefined | null;
  consumerTax: number | undefined | null;
  consumerFee: number | undefined | null;
  permission: any;
  isActive: any;
}

export interface IPriceExportData {
  productId: number | undefined;
  productName: string | undefined;
  discountBuyingPrice: number | undefined;
  discountSellingPrice?: number | undefined;
  currencyName: string | undefined;
  currencyId: number | undefined;
  isActive: boolean | undefined;
  sellingMargin?: number | undefined;
  minPriceRange: string | undefined;
  maxPriceRange: string | undefined;
  minBuyingPrice?: string | undefined;
  maxBuyingPrice?: string | undefined;
  minSellingPrice?: string | undefined;
  maxSellingPrice?: string | undefined;
  isPhysical: boolean | undefined;
  providerSku: string | undefined;
  regionName: string | undefined;
  regionId: number | undefined;
  error?: string | undefined;
  consumerFee?: number | undefined;
  consumerTax?: number | undefined;
}

export class PriceViewDto implements IPriceViewDto {
  id!: number;
  price!: Price;
  priceResults: PriceResultDto[] = [];
  productId?: number | undefined;
}
export interface IPriceViewDto {
  id: number;
  price: Price;
  priceResults: PriceResultDto[];
  productId?: number | undefined;
}
export class PriceResultDto {
  buyingRule?: PriceRule;
  masterRule?: PriceRule;
  rule!: PriceRule;
  masterPriceAmount!: PriceRange;
  buyingPriceAmount!: PriceRange;
  resellPriceAmount!: PriceRange;
  consumerPriceAmount!: PriceRange;
  benefit?: number;
  errors!: PriceRuleError[];
  priceRange: string | undefined;
  discountBuyingPrice: number | undefined;
  buyingPrice: string | undefined;
  discountSellingPrice: number | undefined;
  sellingPrice: string | undefined;
  currency: string | undefined;
}

export interface IUploadRule {
  rowNumber: number;
  productId: number;
  productName: string;
  sellingMargin: number;
  minPriceRange: number;
  maxPriceRange: number;
  currencyName: string;
  isActive: boolean | string;
}

export interface IProductType {
  productTypeId: number;
  productTypeName: string;
}

export class MyPriceListFilterDto {
  productId: number | undefined;
  currencyId: number | undefined;
  categoryId: number | undefined;
  isPhysicalProduct: boolean | null | undefined;

  init(data: IMyPriceListFilterDto) {
    this.productId = data.productId;
    this.currencyId = data.currencyId;
    this.categoryId = data.categoryId;
    this.isPhysicalProduct = data.isPhysicalProduct;
  }
}

export interface IMyPriceListFilterDto {
  productId: number | undefined;
  currencyId: number | undefined;
  categoryId: number | undefined;
  isPhysicalProduct: boolean | null | undefined;
}

export interface IMyPriceListFilterTag {
  producId: string;
  currencyId: string;
  categoryId: number | undefined;
  physicalProduct: boolean;
}
