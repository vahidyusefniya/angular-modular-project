import { Component, OnInit } from "@angular/core";
import { CoreService, TagService } from "@app/core/services";
import { CustomerService } from "../../service/customer.service";
import { LayoutService } from "@app/layout";
import { dictionary } from "@dictionary/dictionary";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-sales-reports-tab",
  templateUrl: "./sales-reports-tab.component.html",
  styleUrls: ["./sales-reports-tab.component.scss"],
})
export class SalesReportsTabComponent {
  dictionary = dictionary;
  customerId: number | undefined;
  branchId: number | undefined;

  constructor(
    private customerService: CustomerService,
    private tagService: TagService,
    private layoutService: LayoutService,
    private coreService: CoreService,
    private titleService: Title,
  ) {
    this.customerId = this.customerService.branch?.merchantId;
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit() {
    this.initBreadcrumbs()
    this.initTitle()
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(this.customerService.branch?.merchantName);

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: dictionary.Customers,
      },
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: '',
      },
    ]);
  }
  initTitle() {
    this.titleService.setTitle(
      `${this.customerService.branch?.merchantName} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }
  ngOnDestroy(): void {
    this.tagService.tagList = [];
  }
}
