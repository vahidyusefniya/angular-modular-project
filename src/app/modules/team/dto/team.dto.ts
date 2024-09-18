import { TeamAddBotParam } from "@app/proxy/proxy";

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
