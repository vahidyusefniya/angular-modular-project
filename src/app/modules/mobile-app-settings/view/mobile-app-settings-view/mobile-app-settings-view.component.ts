// noinspection JSIgnoredPromiseFromCall

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { DeviceMode } from "@app/layout/models/layout.model";
import { AuthenticationClient, Branch, User } from "@app/proxy/proxy";
import { BuyOrder, BuyOrdersClient } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
type Currency = {
  currencyName: string;
};

type Product = {
  productName: string;
  faceValue: number;
  buyCurrency: Currency;
  quantity: number;
  totalBuyAmount: number;
};
@Component({
  selector: "app-mobile-app-settings-view",
  templateUrl: "./mobile-app-settings-view.component.html",
  styleUrls: ["./mobile-app-settings-view.component.scss"],
})
export class MobileAppSettingsViewComponent implements OnInit {
  dictionary = dictionary;
  branchName: string | undefined;
  branches: Branch[] = [];
  selectedBranch: Branch | undefined;
  openChooseBranchModal = false;
  isOpenAlert: boolean = false;
  openDatePickerModal: boolean = false;
  branchId: number;
  deviceMode: DeviceMode = "desktop";
  isDesktopMode = false;
  user = new User();
  loading = false;
  localImageSRC = "../../../../../assets/img/user.jpg";
  printStatus: string | undefined;
  alertButtons = [
    {
      text: dictionary.Close,
      role: "cancel",
      handler: () => {
        this.isOpenAlert = false;
      },
    },
  ];

  constructor(
    private coreService: CoreService,
    private router: Router,
    private layoutService: LayoutService,
    private authService: FirebaseAuthService,
    private alertController: AlertController,
    private authenticationClient: AuthenticationClient,
    private loadingService: LoadingService,
    private ordersClient: BuyOrdersClient,
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branches = this.layoutService.branches;
    this.deviceMode = this.layoutService.getDeviceMode();
  }

  ngOnInit() {
    this.selectedBranch = this.branches.find(
      (b) => b.branchId == this.branchId
    );
    this.setBranchNameInMenu(this.selectedBranch!);
    this.getCurrentUserProfile();
  }

  getCurrentUserProfile() {
    this.loading = true;
    this.authenticationClient.getCurrentUser().subscribe({
      next: (res: User) => {
        this.loading = false;
        this.user.init(res);
      },
      error: (err) => {
        this.loading = false;
        throw Error(err.message);
      },
    });
  }

  changeDeviceModeMode(): void {
    this.layoutService.setDeviceMode("desktop");
    const branch = this.layoutService.branch;
    if (!branch?.canPlaceOrder) {
      location.href = `${location.origin}/branches/${this.branchId}/price-lists`;
    } else location.href = `${location.origin}/branches/${this.branchId}/shop`;
  }

  deviceModeContext(deviceMode: string | undefined): boolean {
    return deviceMode === "mobile";
  }

  branchSelectionChange(branch: Branch): void {
    this.selectedBranch = branch;
    this.branchId = branch.branchId;
    this.setBranchNameInMenu(branch);
    this.layoutService.onChangeBranch(branch);
    this.router.navigate([`/branches/${branch.branchId}/eGift`]);
  }

  setBranchNameInMenu(branch: Branch): void {
    this.branchName =
      branch?.branchName !== "root"
        ? branch?.branchName
        : branch?.merchant?.merchantName;
  }

  async signOut() {
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

  setExchangeRoute() {
    this.router.navigate([`branches/${this.branchId}/mobile-app-settings/exchange-rate`])
  }
  setWalletRoute() {
    this.router.navigate([`branches/${this.branchId}/wallet`])
  }

  printReport(status: string) {
    this.openDatePickerModal = true;
    this.printStatus = status;
  }

  getResultPrint(date: any) {
    let tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.printResult({ begin: date, end: tomorrow.toISOString() }, this.printStatus!)
  }


  printResult(date: any, status: string) {
    this.loadingService.present();
    this.ordersClient.getBuyOrders(
      this.branchId,
      null,
      false,
      null,
      '5',
      new Date(date.begin),
      new Date(date.end),
      -1,
      null
    ).subscribe({
      next: (res: BuyOrder[]) => {
        let buyOrderList = res.filter(item => item.canDownloadCodes);
        if (buyOrderList.length > 0) {
          const totalByAmountList = this.aggregateTotalBuyAmount(buyOrderList);
          const aggregatedProducts = this.aggregateProducts(buyOrderList);
          if (status === 'Order') {
            let buys: any[] = [];
            buys = buyOrderList.map(({ buyOrderDelivery, ...buy }: BuyOrder) => ({
              ...buy,
              productCurrency: buy.productCurrency.currencyName,
              buyCurrency: buy.buyCurrency.currencyName,
              buyerMerchant: buy.buyerMerchant.merchantName,
              sellerMerchant: buy.sellerMerchant.merchantName,
              exchangeCalc: buy.exchangeCalc?.exchangeRate,
              deliveryType: buyOrderDelivery?.deliveryType,
              deliveryTypeValue: buyOrderDelivery?.deliveryTypeValue,
            }));
            this.coreService.exportExcel(buys, 'Order-reports')
          } else {
            this.coreService.exportExcel(aggregatedProducts, 'Product-reports')
          }
        } else {
          this.isOpenAlert = true;
        }
      }, error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        new Error(error.message);
      }, complete: () => {
        this.loadingService.dismiss();
      }
    })
  }


  aggregateProducts(products: Product[]): Product[] {
    const aggregated: { [key: string]: Product } = {};

    products.forEach(product => {
      const key = `${product.productName} ${product.faceValue} ${product.buyCurrency.currencyName}`;
      if (aggregated[key]) {
        aggregated[key].quantity += product.quantity;
      } else {
        aggregated[key] = { ...product };
      }
    });

    return Object.values(aggregated);
  }

  aggregateTotalBuyAmount(products: Product[]): { currency: string, totalBuyAmount: number }[] {
    const aggregated: { [currency: string]: { currency: string, totalBuyAmount: number } } = {};

    products.forEach(product => {
      const currency = product.buyCurrency.currencyName;
      if (aggregated[currency]) {
        aggregated[currency].totalBuyAmount += product.totalBuyAmount;
      } else {
        aggregated[currency] = { currency: currency, totalBuyAmount: product.totalBuyAmount };
      }
    });

    return Object.values(aggregated);
  }
}
