import {
  Branch,
  TransferWalletType,
} from "@app/proxy/proxy";

export class WalletTransactionFilterDto implements IWalletTransactionFilterDto {
  merchant: Branch | undefined;
  from: string | undefined;
  end: string | undefined;
  walletTransactionType: TransferWalletType | undefined;
  currencyId: number | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;

  init(data: IWalletTransactionFilterDto): void {
    this.merchant = data.merchant;
    this.from = data.from;
    this.end = data.end;
    this.walletTransactionType = data.walletTransactionType;
    this.currencyId = data.currencyId;
  }
}

export interface IWalletTransactionFilterDto {
  merchant: Branch | undefined;
  from: string | undefined;
  end: string | undefined;
  walletTransactionType: TransferWalletType | undefined;
  currencyId: number | undefined;
  pageNumber: number | null | undefined;
  pageSize: number | null | undefined;
}

export interface IWalletTransactionTags {
  merchant: string;
  from: string;
  end: string;
  type: string;
  currencyId:number;
}
