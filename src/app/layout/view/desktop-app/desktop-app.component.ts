// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import { DeviceMode } from "@app/layout/models/layout.model";
import { INavItem } from "@app/layout/models/nav-item";
import { LayoutService } from "@app/layout/service/layout.service";
import {
  AuthenticationClient,
  Branch,
  BranchesClient,
  TeamClient,
  User,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { AlertController, MenuController } from "@ionic/angular";
import { Subscription, lastValueFrom } from "rxjs";

@Component({
  selector: "app-desktop-app",
  templateUrl: "./desktop-app.component.html",
  styleUrls: ["./desktop-app.component.scss"],
})
export class DesktopAppComponent implements OnInit, OnDestroy {
  branchId: number;
  dictionary = dictionary;
  navItems: INavItem[] = [];
  selectedBranchName: string | undefined;
  selectedBranch = new Branch();
  branches: Branch[] = [];
  openChooseBranchModal = false;
  parentBranchId!: number | null;
  getCategories$ = new Subscription();
  deviceMode: DeviceMode = "desktop";
  isMobileMode = false;
  isOpen: boolean = false;
  clientProfile = new User();
  isMobileSize: boolean = false;
  localProfileImageSRC = "../../../../assets/img/user.jpg";
  getSubBranchesSub$ = new Subscription();
  offices: Branch[] = [];
  showReturnButton: boolean = false;
  saleManagerName: string | null | undefined;
  showBasketDrawer: boolean = false;
  showBasketItemsTag: boolean = true;
  @ViewChild("popover") popover: any;

  constructor(
    private coreService: CoreService,
    private router: Router,
    private layoutService: LayoutService,
    private teamClient: TeamClient,
    private loadingService: LoadingService,
    private branchesClient: BranchesClient,
    private authenticationClient: AuthenticationClient,
    private authService: FirebaseAuthService,
    private alertController: AlertController,
    private menuController: MenuController,
    private activateRoute: ActivatedRoute
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branches = this.layoutService.branches;
    this.parentBranchId = this.layoutService.getParentBranchId();
    this.deviceMode = this.layoutService.getDeviceMode();
    this.layoutService.selectedBranch.subscribe((branch) => {
      this.selectedBranch = branch;
      this.saleManagerName = branch.merchant?.saleManager?.name;
      this.setBranchNameInMenu(this.selectedBranch!);
      this.initMenu();
    });
    this.isMobileMode = this.deviceMode === "mobile";
    this.isMobileSize = layoutService.checkMobileSize();
    this.saleManagerName =
      this.layoutService.branch?.merchant?.saleManager?.name;

    this.layoutService.toggleDrawer.subscribe((response) => {
      this.showBasketDrawer = response;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url.includes("physical-shop")) {
          this.showBasketItemsTag = true;
          this.layoutService.setDrawer(false);
        } else {
          this.showBasketItemsTag = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getCurrentUserProfile();
    if (!this.layoutService.branch) {
      this.initBranch();
    } else {
      this.selectedBranch = this.layoutService.branch;
      this.showReturnButton = !!this.branches.find(
        (x) => x.branchId === this.parentBranchId
      );
      this.setBranchNameInMenu(this.selectedBranch!);
      this.initMenu();
    }
  }
  initBranch(): void {
    this.branchesClient.get(this.branchId).subscribe({
      next: (res: Branch) => {
        this.selectedBranch = res;
        this.showReturnButton = !!this.branches.find(
          (x) => x.branchId === this.parentBranchId
        );
        this.setBranchNameInMenu(this.selectedBranch!);
        this.initMenu();
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }

  initMenu() {
    this.initNavItems();
    const permissions = this.layoutService.getPermissions();
    this.offices = this.layoutService.offices;
    let hasBranchReadPermission = permissions.find(
      (permission) => permission === "BranchRead"
    );
    if (hasBranchReadPermission) {
      if (this.offices.length == 0) {
        const index = this.navItems.findIndex(
          (n) => n.displayName === dictionary.Offices
        );
        this.navItems.splice(index, 1);
      }
    } else {
      const index = this.navItems.findIndex(
        (n) => n.displayName === dictionary.Offices
      );
      this.navItems.splice(index, 1);
    }
  }
  initNavItems(): void {
    this.navItems = [
      {
        displayName: dictionary.Shop,
        icon: "local_mall",
        route: `branches/${this.branchId}/shop`,
        children: [],
        id: dictionary.ShopMenuId,
        visible: this.checkShowShopItemMenu(),
        permission: "RootCategory",
      },
      {
        displayName: dictionary.PhysicalGiftCards,
        icon: "card_membership",
        expanded: false,
        children: [
          {
            displayName: dictionary.Shop,
            icon: "",
            route: `branches/${this.branchId}/physical-gift-cards/physical-shop`,
            children: [],
            id: dictionary.Shop,
            visible: this.checkShowShopItemMenu(),
            permission: "PlacePhysicalCardOrder",
          },
          {
            displayName: dictionary.ActivateCards,
            icon: "",
            route: `branches/${this.branchId}/physical-gift-cards/activate-cards`,
            children: [],
            id: dictionary.ActivateCards,
            visible: this.checkShowPhysicalGiftCards(),
            permission: "ShopRootCategory",
          },
          {
            displayName: dictionary.CheckCard,
            icon: "",
            route: `branches/${this.branchId}/physical-gift-cards/check-card`,
            children: [],
            id: dictionary.CheckCard,
            visible: this.checkShowPhysicalGiftCards(),
            permission: undefined,
          },
          {
            displayName: dictionary.Orders,
            icon: "",
            route: `branches/${this.branchId}/physical-gift-cards/orders`,
            children: [],
            id: dictionary.Orders,
            visible: this.checkShowPhysicalGiftCards(),
            permission: "PhysicalCardOrderRead",
          },
          {
            displayName: dictionary.CustomerOrders,
            icon: "",
            route: `branches/${this.branchId}/physical-gift-cards/customer-orders`,
            children: [],
            id: dictionary.CustomerOrders,
            visible: this.selectedBranch?.parentBranchId ? true : false,
            permission: "PhysicalCardOrderRead",
          },
        ],
        id: dictionary.PhysicalGiftCards,
        visible:
          this.showParentMenuItem(dictionary.PhysicalGiftCards),
        permission: undefined,
      },
      {
        displayName: dictionary.PriceLists,
        icon: "list_alt",
        // route: `branches/${this.branchId}/price-lists`,
        id: dictionary.PriceLists,
        visible: true,
        children: [
          {
            displayName: dictionary.CustomerPriceList,
            icon: "",
            route: `branches/${this.branchId}/price-lists/customer-price-lists`,
            children: [],
            id: dictionary.CustomerPriceList,
            visible: true,
            permission: "PriceListRead",
          },
          {
            displayName: dictionary.MyPriceList,
            icon: "",
            route: `branches/${this.branchId}/price-lists/my-price-list`,
            children: [],
            id: dictionary.CustomerPriceList,
            visible: true,
            permission: "PriceListRead",
          },
        ],
        permission: "PriceListRead",
      },
      {
        displayName: dictionary.Customers,
        icon: "contacts",
        route: `branches/${this.branchId}/customers`,
        id: dictionary.Customers,
        visible: true,
        children: [],
        permission: "CustomerRead",
      },
      {
        visible: true,
        displayName: dictionary.Offices,
        icon: "store",
        route: `branches/${this.branchId}/offices`,
        id: dictionary.Branches,
        children: [],
        permission: "BranchRead",
      },
      {
        displayName: dictionary.Reports,
        icon: "receipt_long",
        expanded: false,
        children: [
          {
            displayName: dictionary.Buys,
            icon: "",
            route: `branches/${this.branchId}/reports/buys`,
            children: [],
            id: dictionary.Buys,
            visible: !!this.parentBranchId,
            permission: "BuyOrderRead",
          },
          {
            displayName: dictionary.Sales,
            icon: "",
            route: `branches/${this.branchId}/reports/sales`,
            children: [],
            id: dictionary.Sales,
            visible: true,
            permission: "BuyOrderRead",
          },
          {
            displayName: dictionary.AggregateSalesReport,
            icon: "",
            route: `branches/${this.branchId}/reports/aggregate-sales-report`,
            children: [],
            id: dictionary.AggregateSalesReport,
            visible: true,
            permission: "BuyOrderRead",
          },
        ],
        id: dictionary.BuysAndSales,
        visible: this.showParentMenuItem(dictionary.Reports),
        permission: undefined,
      },
      {
        displayName: dictionary.Financial,
        icon: `calculate`,
        id: dictionary.Financial,
        visible: true,
        expanded: false,
        children: [
          {
            displayName: dictionary.Payments,
            icon: "",
            route: `branches/${this.branchId}/financial/peyments`,
            id: dictionary.Payments,
            visible: this.selectedBranch!.canCreatePaymentOrder!,
            children: [],
            permission: "PaymentOrderRead",
          },
          {
            displayName: dictionary.FinancialActivities,
            icon: "",
            route: `branches/${this.branchId}/financial/financial-activities`,
            children: [],
            id: dictionary.FinancialActivities,
            visible: true,
            permission: "FinancialRead",
          },
          // {
          //   displayName: dictionary.Invoices,
          //   icon: "",
          //   route: `branches/${this.branchId}/financial/invoices`,
          //   id: dictionary.Invoices,
          //   visible: true,
          //   children: [],
          //   permission: "CustomerRead",
          // },
        ],
        permission: "RoleRead",
      },
      {
        displayName: dictionary.SaleManagers,
        icon: `support_agent`,
        route: `/branches/${this.branchId}/sale-managers`,
        id: dictionary.SaleManagers,
        visible: true,
        children: [],
        permission: "SaleManagerRead",
      },
      {
        displayName: dictionary.Team,
        icon: "groups",
        route: `branches/${this.branchId}/team`,
        id: dictionary.Team,
        visible: true,
        children: [],
        permission: "RoleRead",
      },
      {
        displayName: dictionary.PostPaid,
        icon: `receipt`,
        route: `/branches/${this.branchId}/postpaid`,
        id: dictionary.PostPaid,
        visible: this.selectedBranch.merchant?.isActivePostPay!,
        children: [],
        permission: "MerchantPostPayRead",
        menuItemWarngin:
          this.selectedBranch.merchant
            ?.postPayAchPaymentMethodProviderProfileId === null,
      },
      {
        displayName: dictionary.CustomerPostpaid,
        icon: `receipt`,
        route: `/branches/${this.branchId}/customer-postpaid`,
        id: dictionary.PostPaid,
        visible: this.selectedBranch.canActivatePostPayForSubMerchant,
        children: [],
        permission: "SubMerchantsPostPayRead",
      },
      {
        displayName: dictionary.GatewayLists,
        icon: "account_balance",
        route: `branches/${this.branchId}/gateway-lists`,
        id: dictionary.GatewayLists,
        visible: this.selectedBranch.canCreateGatewayList,
        children: [],
        permission: "GatewayListRead",
      },
      {
        displayName: dictionary.POS,
        icon: "phone_android",
        expanded: false,
        children: [
          {
            displayName: dictionary.Shop,
            icon: "",
            route: `branches/${this.branchId}/pos/shop`,
            children: [],
            id: dictionary.Shop,
            visible: this.checkShowShopItemMenu(),
            permission: "PosRead",
          },
          {
            displayName: dictionary.Orders,
            icon: "",
            route: `branches/${this.branchId}/pos/orders`,
            children: [],
            id: dictionary.Orders,
            visible: this.checkShowShopItemMenu(),
            permission: "PosOrderRead",
          },
          {
            displayName: dictionary.CustomerOrders,
            icon: "",
            route: `branches/${this.branchId}/pos/all-orders`,
            children: [],
            id: dictionary.CustomerOrders,
            visible: this.selectedBranch?.parentBranchId ? true : false,
            permission: "AllPosOrdersRead",
          },
          {
            displayName: dictionary.DefinePos,
            icon: "",
            route: `branches/${this.branchId}/pos/define-pos`,
            children: [],
            id: dictionary.DefinePos,
            visible: true,
            permission: "PosWrite",
          },
        ],
        id: dictionary.DefinePos,
        visible: true,
        permission: undefined,
      },
      {
        displayName: dictionary.ReturnOrders,
        icon: `assignment_return`,
        route: `/branches/${this.branchId}/return-orders`,
        id: dictionary.ReturnOrders,
        visible: true,
        children: [],
        permission: "SaleReturnOrder",
      },
      {
        displayName: dictionary.Settings,
        icon: `settings`,
        route: `/branches/${this.branchId}/settings`,
        id: dictionary.Settings,
        visible: this.selectedBranch?.parentBranchId ? false : true,
        children: [],
        permission: undefined,
      },
      {
        displayName: dictionary.AllCustomers,
        icon: `manage_accounts`,
        route: `/branches/${this.branchId}/all-customers`,
        id: dictionary.AllCustomers,
        visible: true,
        children: [],
        permission: "ProductRead",
      },
      {
        displayName: dictionary.Stock,
        icon: `inventory`,
        id: dictionary.Stock,
        visible: this.showParentMenuItem(dictionary.Stock),
        expanded: false,
        children: [
          {
            displayName: dictionary.AvailableItems,
            icon: "",
            route: `branches/${this.branchId}/stock/available-items`,
            children: [],
            id: dictionary.Available,
            visible: true,
            permission: "StockAvailableItems",
          },
        ],
        permission: undefined,
      },
      {
        displayName: dictionary.BaseInfo,
        icon: "construction",
        expanded: false,
        children: [
          {
            displayName: dictionary.Categories,
            icon: "",
            route: `branches/${this.branchId}/base-information/categories`,
            children: [],
            id: dictionary.Categories,
            visible: true,
            permission: "CategoryWrite",
          },
          {
            displayName: dictionary.Currencies,
            icon: "",
            route: `branches/${this.branchId}/base-information/currencies`,
            children: [],
            id: dictionary.Currencies,
            visible: true,
            permission: "CurrencyWrite",
          },
          {
            displayName: dictionary.Regions,
            icon: "",
            route: `branches/${this.branchId}/base-information/regions`,
            children: [],
            id: dictionary.Regions,
            visible: true,
            permission: "CurrencyWrite",
          },
          {
            displayName: dictionary.Products,
            icon: "",
            route: `branches/${this.branchId}/base-information/products`,
            children: [],
            id: dictionary.Products,
            visible: true,
            permission: "ProductRead",
          },
          {
            displayName: dictionary.Banks,
            icon: "",
            route: `branches/${this.branchId}/base-information/banks`,
            children: [],
            id: dictionary.Banks,
            visible: true,
            permission: "BankWrite",
          },
        ],
        id: dictionary.BaseInfo,
        visible: this.showParentMenuItem(dictionary.BaseInfo),
        permission: undefined,
      },
    ];
  }

  showParentMenuItem(name: string): boolean {
    let showItem = false;
    const permissions = this.layoutService.getPermissions();
    if (name === dictionary.Reports) {
      const isPermission = permissions.find((p) => p === "BuyOrderRead");
      if (isPermission) showItem = true;
    }
    if (name === dictionary.BaseInfo) {
      const isPermission = permissions.find(
        (p) =>
          p === "CategoryWrite" ||
          p === "CurrencyWrite" ||
          p === "BankWrite" ||
          p === "ProductWrite" ||
          p === "RegionWrite"
      );
      if (isPermission) showItem = true;
    }
    if (name === dictionary.Stock) {
      const isPermission = permissions.find(
        (p) => p === "StockAvailableItems" || p === "StockOrderRead"
      );
      if (isPermission) showItem = true;
    }

    if (name === dictionary.PhysicalGiftCards) {
      const isPermission = permissions.find((p) => p === "ShopBuyOrderRead");
      if (isPermission) showItem = true;
    }

    return showItem;
  }
  async branchSelectionChange(data: Branch) {
    try {
      this.loadingService.present();
      this.branchId = data.branchId;

      const branches = await lastValueFrom(
        this.teamClient.getMerchantsBranch()
      );
      const branch = branches.find((x) => x.branchId === data.branchId)!;

      const offices = await lastValueFrom(
        this.branchesClient.getSubBranches(this.branchId!)
      );
      this.layoutService.setOffices(offices);
      this.offices = offices;

      this.layoutService.setSelectedBranch(branch);
      this.selectedBranch = branch;
      this.parentBranchId = branch.merchant?.parentBranchId!;
      this.navItems = [];
      this.initPermissions(String(this.branchId), this.selectedBranch);

      await this.menuController.close();
      this.loadingService.dismiss();
    } catch (error) {
      this.loadingService.dismiss();
      throw Error(JSON.stringify(error));
    }
  }
  initPermissions(resourceId: string, data: Branch): void {
    const me = this;
    this.loadingService.present();
    this.teamClient.listCurrentUserPermissions(resourceId).subscribe({
      next(res: string[]) {
        me.loadingService.dismiss();
        me.layoutService.setPermissions(res);
        me.setBranchNameInMenu(data);
        me.initMenu();
        if (data.canPlaceOrder) {
          me.router.navigate([`/branches/${data.branchId}/shop`]);
        } else {
          me.router.navigate([`/branches/${data.branchId}/price-lists`]);
        }
        me.layoutService.onChangeBranch(data);
      },
      error(error: ResponseErrorDto) {
        me.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }
  setBranchNameInMenu(branch: Branch): void {
    if (this.router.url.includes("forbidden")) {
      return;
    }
    this.selectedBranchName =
      branch?.branchName !== "root"
        ? branch?.branchName
        : branch?.merchant?.merchantName;

    this.layoutService.branchName = this.selectedBranchName;
  }
  changeDeviceModeMode(): void {
    this.layoutService.setDeviceMode("mobile");
    location.href = `${location.origin}/branches/${this.branchId}/eGift`;
  }

  deviceModeContext(deviceMode: string | undefined): boolean {
    return deviceMode === "mobile";
  }

  redirectToPayment(): void {
    this.router.navigate([`/branches/${this.branchId}/payment`]);
  }

  checkShowShopItemMenu(): boolean {
    return this.selectedBranch?.canPlaceOrder!;
  }
  checkShowPhysicalGiftCards(): boolean {
    return this.selectedBranch?.canPlaceOrder;
  }

  openProfilePopop(event: Event) {
    this.popover.event = event;
    this.isOpen = true;
  }

  getCurrentUserProfile() {
    this.authenticationClient.getCurrentUser().subscribe({
      next: (res: User) => {
        this.clientProfile = res;
      },
      error: (err) => {
        throw Error(err.message);
      },
    });
  }

  onReturnToClick(branch: Branch): void {
    if (branch.canPlaceOrder) {
      location.href = `${location.origin}/branches/${branch.parentBranchId}/shop`;
    } else {
      location.href = `${location.origin}/branches/${branch.parentBranchId}/price-lists`;
    }
  }

  async onLogoutClick() {
    const alert = await this.alertController.create({
      header: dictionary.SignOut!,
      message: dictionary.SignOutConfirmMessage,
      animated: false,
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.SignOut,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.authService.signout();
          },
        },
      ],
    });
    await alert.present();
  }

  onMenuItemClick(navItem: INavItem): void {
    this.navItems.forEach((item) => {
      if (navItem.id === item.id) {
        item.expanded = navItem.expanded;
      } else {
        item.expanded = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.getCategories$.unsubscribe();
    this.getSubBranchesSub$.unsubscribe();
  }
}
