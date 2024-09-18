import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  BranchesClient,
  PriceList,
  PriceListsClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import { CustomerService } from "../../service/customer.service";

@Component({
  selector: "app-price-list-tab",
  templateUrl: "./price-list-tab.component.html",
  styleUrls: ["./price-list-tab.component.scss"],
})
export class PriceListTabComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  priceLists: PriceList[] = [];
  openAssignPriceListModal = false;
  assignPriceListModalTitle: string | undefined;
  assignedPriceListId: number | undefined;
  branchId: number;
  parentPriceListId: number;
  assignPriceList$ = new Subscription();
  getPriceList$ = new Subscription();
  loading = false;
  assignedPriceListName: string | undefined;
  branches: Branch[] = [];
  merchantBranchId: number | undefined;
  initBranch$ = new Subscription();
  subBranchId: number | undefined;

  constructor(
    private branchesClient: BranchesClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private priceListsClient: PriceListsClient,
    private customerService: CustomerService,
    private coreService: CoreService,
    private branchClient: BranchesClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.parentPriceListId = this.customerService.branch?.rootPriceListId!;
    this.branches = this.layoutService.branches;
    this.assignedPriceListName =
      this.customerService.branch?.assignedPriceList?.priceListName!;
    this.assignedPriceListId =
      this.customerService.branch?.assignedPriceList?.priceListId;
    this.merchantBranchId = this.customerService.branch?.branchId;

    this.subBranchId = this.coreService.getSubBranchId()!;
  }

  ngOnInit() {
    this.initPriceLists();
  }

  initPriceLists(): void {
    this.loading = true;
    this.getPriceList$ = this.priceListsClient
      .getByBranch(this.branchId)
      .subscribe({
        next: (res: PriceList) => {
          this.priceLists = [];
          this.priceLists.push(res);
          res.priceLists?.forEach((item) => {
            this.priceLists.push(item);
          });
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
  onAssignPriceListClick(): void {
    this.assignPriceListModalTitle = `${dictionary.AssignPriceList} to "${this.customerService.branch?.merchantName}"`;
    this.openAssignPriceListModal = true;
  }
  assignPriceList(data: { id: number; name: string }): void {
    this.loadingService.present();
    this.assignPriceList$ = this.branchesClient
      .assignPriceList(this.branchId, data.id, this.merchantBranchId!)
      .subscribe({
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.assignedPriceListName = data.name;
          this.assignedPriceListId = data.id;
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `assign price list "${data.name}" to branch "${this.customerService.branch?.merchantName}" successfully`
          );
          this.getBranch();
        },
      });
  }

  getBranch() {
    this.loading = true;
    this.initBranch$ = this.branchClient
      .getSubMerchant(this.branchId, this.subBranchId!)
      .subscribe((response: Branch) => {
        this.customerService.setBranch(response);

        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.getPriceList$.unsubscribe();
    this.assignPriceList$.unsubscribe();
  }
}
