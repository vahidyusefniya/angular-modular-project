import { Currency } from "@app/proxy/shop-proxy";

export interface ExchangeProduct {
  unitFaceValuePrice?: number | undefined;
  unitBuyPrice: number | undefined;
  totalPrice: number | undefined;
  productId?: number;
  productName?: string;
  imageUrl?: string | null;
  providerSku?: string;
  upc?: string | null;
  isPhysical?: boolean;
  hasDescription?: boolean;
  categoryId?: number;
  currency: Currency;
}


