export interface INavItem {
  displayName: string;
  icon: string;
  route?: string;
  children?: INavItem[];
  id: string;
  visible: boolean;
  permission: string | undefined;
  expanded?: boolean;
  menuItemWarngin?: boolean | undefined
}
