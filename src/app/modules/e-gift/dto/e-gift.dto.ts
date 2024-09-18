import { ProductShopDto } from "@app/modules/shop/dto/shop.dto";

export class RegionDto implements IRegionDto {
  id: number | undefined;
  name: string | undefined;
  code: string | undefined;
  phone_prefix: string | undefined;
  image: string | null | undefined;
}
export interface IRegionDto {
  id: number | undefined;
  name: string | undefined;
  code: string | undefined;
  phone_prefix: string | undefined;
  image: string | null | undefined;
}

export type ReceiveFormType = "Email" | "Sms" | "WhatsApp" | "download";

export interface ICheckout {
  product: ProductShopDto;
  faceValuePrice: number;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
}
