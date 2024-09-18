import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutService } from "@app/layout";
import { CoreService } from "@core/services";
import { dictionary } from "@dictionary/dictionary";
import { Branch, BranchesClient } from "@proxy/proxy";
import { Subscription } from "rxjs";
import { CustomerService } from "../../service/customer.service";
import { ITab } from "../../dto/customer.dto";

@Component({
  selector: "app-customer-detail",
  templateUrl: "./customer-detail.component.html",
  styleUrls: ["./customer-detail.component.scss"],
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  assignedPriceListId: number | undefined;
  subBranchId: number | undefined;
  initBranch$ = new Subscription();
  loading: boolean = true;
  branchId: number | undefined;
  items: ITab[] = [];
  activeItem: any = this.items[0];

  constructor(
    private customerService: CustomerService,
    private layoutService: LayoutService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private branchClient: BranchesClient,
    private coreService: CoreService,
    private router: Router
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.activatedRoute.params.subscribe((params) => {
      this.subBranchId = Number(params["customerId"]);
    });
  }

  ngOnInit() {
    this.initTabs();
    this.getBranch();
  }

  initTabs(): void {
    const canActivatePostPayForSubMerchant =
      this.layoutService.branch?.canActivatePostPayForSubMerchant;
    const permissions: string[] = this.layoutService.getPermissions();
    let tabs: ITab[] = [
      {
        label: dictionary.PriceList,
        routerLink: "price-list",
        id: "price-list",
        permission: undefined,
      },
      {
        label: dictionary.Wallet,
        routerLink: "wallet",
        id: "wallet",
        permission: undefined,
      },
      {
        label: dictionary.FinancialActivities,
        routerLink: "financial-activities",
        id: "financial-activities",
        permission: undefined,
      },
      {
        label: dictionary.SalesReport,
        routerLink: "sales-reports",
        id: "reports",
        permission: undefined,
      },
      {
        label: dictionary.BuyLimits,
        routerLink: "buy-limits",
        id: "buy-limits",
        permission: undefined,
      },
      {
        label: dictionary.Postpaid,
        routerLink: "postpaid",
        id: "Postpaid",
        permission: "SubMerchantsPostPayRead",
      },
      {
        label: dictionary.GatewayList,
        routerLink: "gateway-list",
        id: "gateway-list",
        permission: undefined,
      },
      {
        label: dictionary.PhysicalOrders,
        routerLink: "physical-orders",
        id: "physical-orders",
        permission: "PhysicalCardOrderRead",
      },
      {
        label: dictionary.Info,
        routerLink: "info",
        id: "info",
        permission: undefined,
      },
    ];
    tabs.forEach((tab) => {
      if (!tab.permission) return;
      const checkPermission = permissions.find((p) => p === tab.permission);
      if (tab.id === "Postpaid") {
        if (!canActivatePostPayForSubMerchant || !checkPermission) {
          tabs = tabs.filter((t) => t.id !== tab.id);
        }
      } else {
        if (!checkPermission) tabs = tabs.filter((t) => t.id !== tab.id);
      }
    });
    this.items = tabs;
  }

  setTabmenuWidth() {
    const tabmenu = document.querySelector(".p-tabmenu") as any;
    if (window.innerWidth > 991) {
      tabmenu.style.width = `${window.innerWidth - 233}px`;
    } else {
      tabmenu.style.width = `${window.innerWidth - 20}px`;
    }
    addEventListener("resize", (event) => {
      if (window.innerWidth > 991) {
        tabmenu.style.width = `${window.innerWidth - 233}px`;
      } else {
        tabmenu.style.width = `${window.innerWidth - 20}px`;
      }
    });

    const tabmenuItems = document.querySelectorAll(
      ".p-tabmenu .p-element a"
    ) as any;
    tabmenuItems.forEach((item: HTMLElement, index: number) => {
      const thisClass = this;
      item.addEventListener("click", function (e: any) {
        if (index === 0 || index === 1) {
          (document.querySelector(".p-tabmenu-nav-content") as any).scroll(
            0,
            0
          );
        } else if (
          index === thisClass.items.length - 1 ||
          index === thisClass.items.length - 2
        ) {
          (document.querySelector(".p-tabmenu-nav-content") as any).scroll(
            1000,
            0
          );
        } else {
          (document.querySelector(".p-tabmenu-nav-content") as any).scroll(
            thisClass.getPageTopLeft(e.srcElement).left,
            0
          );
        }
      });
    });
  }
  getPageTopLeft(el: any) {
    var rect = el.getBoundingClientRect();
    var docEl = document.documentElement;
    return {
      left: rect.left > 0 ? rect.left - 100 : 100,
      top: rect.top + (window.pageYOffset || docEl.scrollTop || 0),
    };
  }

  getBranch() {
    this.initBranch$ = this.branchClient
      .getSubMerchant(this.branchId!, this.subBranchId!)
      .subscribe((response: Branch) => {
        this.customerService.setBranch(response);
        this.initBreadcrumbs();
        this.initTitle();
        if (
          window.location.pathname ===
          `/branches/${this.branchId}/customers/${this.customerService.branch?.branchId}`
        ) {
          this.router.navigate([
            `/branches/${this.branchId}/customers/${this.customerService.branch?.branchId}/price-list`,
          ]);
        }
        this.loading = false;
        setTimeout(() => {
          this.setTabmenuWidth();
        }, 100);
      });
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      this.customerService.branch?.merchantName
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: dictionary.Customers,
      },
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: "",
      },
    ]);
  }
  initTitle() {
    this.titleService.setTitle(
      `${this.customerService.branch?.merchantName} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }

  ngOnDestroy() {
    this.initBranch$.unsubscribe();
    this.layoutService.setBreadcrumbVariable(``);
    this.layoutService.setBreadcrumbs([]);
  }
}
