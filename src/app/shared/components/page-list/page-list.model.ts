export interface ICol {
  width: string;
  minWidth?: string;
  maxWidth?: string;
  hasNormalRow?: boolean;
  hasStatusRow?:boolean;
  hasLinkRow?: boolean;
  linkRowPermission?: string;
  isRouteLink?: boolean;
  hasIconRow?: boolean;
  hasToggleRow?: boolean;
  hasTextIconRow?: boolean;
  hasAmountRow?: boolean;
  hasAmountSign?: boolean;
  hasImageRow?: boolean;
  hasTextButtonRow?: boolean;
  hasTextButtonRowPermission?: string;
  textButtonIconRow?: string;
  textButtonLabelRow?: string;
  hasNumericRow?: boolean;
  hasButtonRow?: boolean;
  hasNumberRow?: boolean;
  hasDateTimeRow?: boolean;
  buttonRow?: IButtonRow[];
  iconRow?: IIconRow[];
  field: string;
  header: string;
  hidden: boolean;
  customCss?: any;
  customClass?: any;
  sortable?: boolean
}

export interface ILinkRow {
  data: any;
  colName: string;
}

export interface IToggleRow {
  data: any;
  colName: string;
  event: Event;
}

export interface IButtonRow {
  name: string | undefined;
  icon: string | undefined;
  permission: string;
  eventName: string;
  fill: string;
  color: string;
}
export interface IIconRow {
  name: string | undefined;
  type: string | undefined;
  permission: string;
  eventName: string;
  fill: string;
  color: string;
}
