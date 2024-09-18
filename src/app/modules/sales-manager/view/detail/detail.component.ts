import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { SaleManager, SaleManagersClient } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import { SalesManagerService } from "../../service/sales-manager.service";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit {
  dictionary = dictionary;
  initManager$ = new Subscription();
  saleManagerId!: number;
  branchId!: number;
  items: any[] = [
    {
      label: dictionary.AssignedCustomers,
      routerLink: "assigned-customers",
      id: "assigned-customers",
    },
    {
      label: dictionary.Reports,
      routerLink: "reports",
      id: "reports",
    },
    {
      label: dictionary.Info,
      routerLink: "info",
      id: "info",
    },
  ];
  loading = true;
  activeItem: any = this.items[0];
  showTab: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private saleManagerService: SaleManagersClient,
    private coreService: CoreService,
    private titleService: Title,
    private salesService: SalesManagerService

  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.saleManagerId = Number(params["saleManagerId"]);
    });
    this.branchId = coreService.getBranchId()!;
  }

  ngOnInit() {
    this.getSaleManager();
    setTimeout(() => {
      this.showTab = true;
    }, 500);
  }

  getSaleManager() {
    this.initManager$ = this.saleManagerService
      .get(this.branchId, this.saleManagerId)
      .subscribe(
        {
          next: (response: SaleManager) => {
            this.salesService.setSaleManager = response;
            this.initBreadcrumbs();
            this.initTitle();
          },
          error: (err) => {
          },
          complete: () => {
            this.loading = false;
            this.showTab = true;
          }
        })

  }

  initTitle() {
    this.titleService.setTitle(
      `${this.salesService.getSaleManager?.name} - ${dictionary.SaleManagers} - ${this.layoutService.branchName}`
    );
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      `${this.salesService.getSaleManager?.name}`
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/sale-managers`,
        deActive: false,
        label: dictionary.SaleManagers,
      },
      {
        url: `/branches/${this.branchId}/sale-managers/${this.salesService.getSaleManager?.saleManagerId}`,
        deActive: false,
        label: dictionary.Detail,
      },
    ]);
  }

  ngOnDestroy() {
    this.initManager$.unsubscribe();
    this.layoutService.setBreadcrumbVariable(``);
    this.layoutService.setBreadcrumbs([]);
  }
}
