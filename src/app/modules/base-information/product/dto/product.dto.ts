export class ProviderDto implements IProviderDto {
  providerName: string | undefined;
  providerId: number | undefined;
}

export interface IProviderDto {
  providerName: string | undefined;
  providerId: number | undefined;
}
