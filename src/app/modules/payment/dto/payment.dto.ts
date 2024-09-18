export interface IPaymentProfilesDto {
  paymentProfileId: number | undefined;
  paymentProfileName: string | undefined;
  providerIcon: string | undefined;
  maxAmount: number | undefined;
  minAmount: number | undefined;
  description: string | undefined;
  currencyName: string | undefined;
  currencyId: number | undefined;
  symbol: string | undefined;
  hasAutoPayment: boolean | undefined;
  providerProfileId: number | undefined;
}

export interface IPaymentMethodsDto {
  paymentMethodId: number | undefined;
  paymentMethodNumber: string | undefined;
  paymentMethodType: string | undefined;
  paymentMethodTypeId: number | undefined;
  paymentMethodProviderProfileId: number | undefined;
  profileId: number | undefined;
  profileName: string | undefined;
}
