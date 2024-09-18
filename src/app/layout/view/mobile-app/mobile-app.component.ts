// noinspection JSIgnoredPromiseFromCall

import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { CoreService } from "@app/core/services";
import { DeviceMode, ITab } from "@app/layout/models/layout.model";
import { LayoutService } from "@app/layout/service/layout.service";
import { CategoryProduct, ProductsClient } from "@app/proxy/shop-proxy";
import { ResponseErrorDto } from "@core/dto/core.dto";
import { dictionary } from "@dictionary/dictionary";
import { NavController } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-mobile-app",
  templateUrl: "./mobile-app.component.html",
  styleUrls: ["./mobile-app.component.scss"],
})
export class MobileAppComponent implements OnInit, OnDestroy {
  tabs: ITab[] = [];
  branchId: number;
  changeBranch$ = new Subscription();
  loading = false;
  getCategories$ = new Subscription();
  dictionary = dictionary;
  deviceMode: DeviceMode = "desktop";
  width = 0;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  constructor(
    private coreService: CoreService,
    private router: NavController,
    private layoutService: LayoutService,
    private productsClient: ProductsClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.changeBranch$ = this.layoutService.changeBranch.subscribe((branch) => {
      this.branchId = branch.branchId;
      this.initTabs();
      this.loading = true;
      this.initCategoryProduct();
    });
    this.deviceMode = this.layoutService.getDeviceMode();
    this.layoutService.selectedBranch.subscribe((branch) => {
      this.branchId = branch.branchId;
      this.initTabs();
      this.initPageContent();
    });
  }

  ngOnInit(): void {
    this.width = window.innerWidth;
    this.initTabs();
    this.initPageContent();
  }
  initPageContent(): void {
    const categoryProducts = this.layoutService.rootCategory;
    if (!categoryProducts) this.initCategoryProduct();
    else this.loading = false;
  }
  initCategoryProduct(): void {
    this.loading = true;
    this.getCategories$ = this.productsClient
      .getProducts(this.branchId)
      .subscribe({
        next: (res: CategoryProduct) => {
          this.layoutService.setRootCategory(res);
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }
  initTabs(): void {
    this.tabs = [
      {
        name: "eGift",
        icon: "card_membership",
        path: `/branches/${this.branchId}/eGift`,
        disabled: this.layoutService.branch?.canPlaceOrder ? false : true,
      },
      {
        name: dictionary.Activate,
        icon: "barcode_scanner",
        path: `/branches/${this.branchId}/activate`,
        disabled: this.layoutService.branch?.canPlaceOrder ? false : true,
      },
      {
        name: dictionary.QrCode,
        icon: "qr_code_scanner",
        path: `/branches/${this.branchId}/qr-code`,
        disabled: true,
      },
      {
        name: dictionary.Orders,
        icon: "history",
        path: `/branches/${this.branchId}/orders`,
        disabled: false,
      },
    ];
  }

  handleRefresh(): void {
    setTimeout(() => {
      location.reload();
    }, 500);
  }

  onTabClick(path: string): void {
    if (path === `branches/${this.branchId}/eGift`) this.initCategoryProduct();
    this.router.navigateForward([path], { animated: false });
  }

  ngOnDestroy(): void {
    this.changeBranch$.unsubscribe();
  }
}
