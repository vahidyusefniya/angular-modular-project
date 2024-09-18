// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CreatePriceListRequest,
  PriceList,
  PriceListsClient,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { TreeNode } from "primeng/api";
import { Subscription } from "rxjs";

@Component({
  selector: "app-price-lists",
  templateUrl: "./price-lists.component.html",
  styleUrls: ["./price-lists.component.scss"],
})
export class PriceListsComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  priceTreeList: TreeNode[] = [
    {
      data: {},
      children: [],
    },
  ];
  priceLists: PriceList[] = [];
  cols: ICol[] = [
    {
      field: "priceListName",
      header: dictionary.Name,
      hasLinkRow: true,
      width: "auto",
      hidden: false,
    },
  ];
  loading = false;
  openCreatePriceList = false;
  branchId: number;
  parentPriceListId: number;
  exportData: PriceList[] = [];
  getPriceLists$ = new Subscription();
  createPriceList$ = new Subscription();
  priceRouterLink: string = "";

  constructor(
    private priceListsClient: PriceListsClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private titleService: Title
  ) {
    this.branchId = coreService.getBranchId()!;
    this.parentPriceListId = this.layoutService.getParentPriceListId();
    this.layoutService.setTabName(dictionary.PriceLists);
    this.layoutService.checkPagePermission("PriceListRead");
  }

  ngOnInit() {
    this.priceRouterLink = `/branches/${this.branchId}/price-lists/customer-price-list/prices`;
    this.initPriceLists();
    this.initTitle();
  }

  initTitle() {
    this.titleService.setTitle(
      `${dictionary.CustomerPriceList} - ${this.layoutService.branchName}`
    );
  }

  initPriceLists(): void {
    this.loading = true;
    this.getPriceLists$ = this.priceListsClient
      .get(this.branchId, this.parentPriceListId)
      .subscribe({
        next: (res: PriceList) => {
          this.exportData = res.priceLists!;
          this.priceListsToTreeNodes(res);
          this.expandChildren();
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }
  private priceListsToTreeNodes(priceList: PriceList) {
    this.priceTreeList = [
      {
        data: {},
        children: [],
      },
    ];
    this.priceTreeList[0].data = {
      priceListName: priceList.priceListName,
      priceListId: priceList.priceListId,
    };
    this.priceTreeList[0].children = [];
    if (!priceList.priceLists) return;
    for (let item of priceList.priceLists) {
      this.priceTreeList[0].children.push({
        data: {
          priceListName: item.priceListName,
          priceListId: item.priceListId,
        },
      });
    }
  }

  expandChildren() {
    setTimeout(() => {
      let button: any = document.getElementById("treeTableToggler")!;
      if (button) button.children[0].click();
    }, 100);
  }

  newPriceList(priceList: CreatePriceListRequest): void {
    this.openCreatePriceList = false;
    priceList.init({
      parentPriceListId: this.parentPriceListId,
      priceListName: priceList.priceListName,
    });
    this.loadingService.present();
    this.createPriceList$ = this.priceListsClient
      .create(this.branchId, priceList)
      .subscribe({
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Price list "${priceList.priceListName}" added successfuly`
          );
          this.initPriceLists();
        },
      });
  }

  onRefreshClick(): void {
    this.initPriceLists();
  }

  onExcelExportClick(): void {
    if (this.priceLists.length == 0) return;
    this.coreService.exportExcel(this.exportData, "priceLists");
  }

  ngOnDestroy(): void {
    this.getPriceLists$.unsubscribe();
    this.createPriceList$.unsubscribe();
  }
}
