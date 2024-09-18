import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { StorageService } from "@app/core/services";
import {
  Branch,
  //  CategoryProduct
} from "@app/proxy/proxy";
import { Platform } from "@ionic/angular";
import { IBreadCrumb } from "@shared/components/breadcrumb/breadcrumb.interface";
import { Subject } from "rxjs";
import { DeviceMode } from "../models/layout.model";
import { CategoryProduct } from "@app/proxy/shop-proxy";
import {
  BasketProductShopDto,
  ProductShopDto,
} from "@app/modules/shop/dto/shop.dto";

@Injectable({
  providedIn: "root",
})
export class LayoutService {
  changeBranch = new Subject<Branch>();
  isSmallMode = new Subject<boolean>();
  backButton: Subject<string> = new Subject<string>();
  breadcrumbVariable = new Subject<string | undefined>();
  branchName: string | undefined;
  branches: Branch[] = [];
  branch: Branch | undefined;
  breadcrumbsItems = new Subject<IBreadCrumb[]>();
  rootCategory: CategoryProduct | undefined;
  permissions: string[] = [];
  selectedBranch: Subject<Branch> = new Subject();
  offices: Branch[] = [];
  showBasketDrawer: boolean = true
  toggleDrawer: Subject<boolean> = new Subject();
  basketProducts: BasketProductShopDto[] = [];
  basketListener = new Subject<BasketProductShopDto[]>();
  showCheckoutModal: Subject<boolean> = new Subject();

  constructor(
    private platform: Platform,
    private titleService: Title,
    private storageService: StorageService,
    private router: Router
  ) {}

  checkMobileSize(): boolean {
    const ScrWidth = window.innerWidth;
    if (ScrWidth > 600) {
      this.isSmallMode.next(false);
      return false;
    } else {
      this.isSmallMode.next(true);
      return true;
    }
  }

  onBackButtonClick(): void {
    this.backButton.next("back");
  }

  setOffices(offices: Branch[]): void {
    this.offices = offices;
  }

  getDeviceMode(): DeviceMode {
    let deviceMode: DeviceMode;
    const defaultDeviceMode = this.getDeviceModeFromStorage();
    if (defaultDeviceMode && this.isValidDeviceName(defaultDeviceMode)) {
      deviceMode = this.getDeviceModeFromStorage();
    } else deviceMode = this.getDeviceModeFromDevice();

    this.storageService.set("defaultDeviceMode", deviceMode);
    return deviceMode;
  }
  setDeviceMode(deviceMode: DeviceMode): void {
    this.storageService.set("defaultDeviceMode", deviceMode);
  }
  private getDeviceModeFromDevice(): DeviceMode {
    let appMode: DeviceMode;
    if (this.platform.is("android") || this.platform.is("ios")) {
      appMode = "mobile";
    } else {
      appMode = "desktop";
    }

    return appMode;
  }
  private getDeviceModeFromStorage(): DeviceMode | undefined {
    let appMode: DeviceMode;
    appMode = this.storageService.get("defaultDeviceMode");
    return appMode;
  }
  private isValidDeviceName(deviceMode: string | undefined): boolean {
    if (!deviceMode) return false;
    return !(deviceMode !== "desktop" && deviceMode !== "mobile");
  }

  onChangeBranch(data: Branch): void {
    this.changeBranch.next(data);
  }

  setTabName(name: string): void {
    this.titleService.setTitle(`${name} - ${this.branchName}`);
  }

  setBreadcrumbVariable(data: string | undefined): void {
    this.breadcrumbVariable.next(data);
  }

  setDrawer(data: boolean): void {
    this.showBasketDrawer = data
    this.toggleDrawer.next(data);
  }

  setCheckoutModal(data: boolean) {
    this.showCheckoutModal.next(data);
  }

  updateBranches(branches: Branch[]): void {
    this.branches = branches;
  }

  updateBranch(branch: Branch | undefined): void {
    if (!branch) return;
    this.branch = branch;
    this.branchName =
      branch.branchName === "root"
        ? branch.merchant?.merchantName
        : `${branch.merchant?.merchantName} (${branch.branchName})`;
  }

  getParentPriceListId(): number {
    return this.branch?.rootPriceListId!;
  }
  getWalletId(): number {
    return this.branch?.merchant?.walletId!;
  }
  getParentBranchId(): number | null {
    return this.branch?.merchant?.parentBranchId!;
  }

  addToCard(product: BasketProductShopDto & { quantity: number }): void {
    let findedProductIndex = this.basketProducts.findIndex(
      (x) => x.productId === product.productId
    );
    if (findedProductIndex !== -1) {
      const previousQuantity = this.basketProducts[findedProductIndex].quantity
      this.basketProducts[findedProductIndex].quantity = previousQuantity + product.quantity;
    } else {
      this.basketProducts.push(product);
    }
    this.basketListener.next(this.basketProducts);
  }

  clearBasketItems() {
    this.basketProducts = []
    this.basketListener.next(this.basketProducts);
  }

  getBasketItems(): number {
    return this.basketProducts.length;
  }

  setSelectedBranch(branch: Branch): void {
    this.selectedBranch.next(branch);
  }

  setRootCategory(rootCategory: CategoryProduct): void {
    this.rootCategory = rootCategory;
  }

  setBreadcrumbs(data: IBreadCrumb[]): void {
    this.breadcrumbsItems.next(data);
  }

  getPermissions(): string[] {
    return this.permissions;
  }
  setPermissions(permissions: string[]): void {
    this.permissions = permissions;
  }
  checkPagePermission(permission: string): void {
    const isPermissions = this.permissions.find((p) => p === permission);
    if (!isPermissions) this.router.navigate(["/forbidden"]);
  }
  getBranch(branchId: number): Branch | undefined {
    const branch = this.branches.find((x) => x.branchId === branchId);
    if (branch) {
      return branch;
    }
    return undefined;
  }
}
