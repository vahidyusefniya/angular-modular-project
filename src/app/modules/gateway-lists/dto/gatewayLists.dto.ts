import { MerchantSummary, TeamAddBotParam } from "@app/proxy/proxy";

export class NewMember implements INewMember {
  roleId: string | undefined;
  email: string | undefined;
}
export interface INewMember {
  roleId: string | undefined;
  email: string | undefined;
}

export class NewBot implements INewBot {
  roleId: string | undefined;
  addParam = new TeamAddBotParam();
}
export interface INewBot {
  roleId: string | undefined;
  addParam: TeamAddBotParam;
}

export interface IGatewayLists {
  name: string;
  merchantName: string;
  gatewayListId: number
  rootBranchId: number
  merchantId: number
}
export interface IPaymentProfile {
  paymentProfileId: number;
  paymentProfileName: string;
  providerImage: string;
  isActive: boolean
  allSubCustomerState: boolean
}
