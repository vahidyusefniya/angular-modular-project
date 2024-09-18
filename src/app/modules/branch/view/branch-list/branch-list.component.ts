// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
  StorageService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  BranchLight,
  BranchesClient,
  PriceList,
  PriceListsClient,
  TeamClient,
} from "@app/proxy/proxy";
import {
  ICol,
  ILinkRow,
} from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";
import { CreateBranchRequest } from "../../dto/branch.dto";

@Component({
  selector: "app-branch-list",
  templateUrl: "./branch-list.component.html",
  styleUrls: ["./branch-list.component.scss"],
})
export class BranchListComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  branchList: Branch[] = [];
  allBranchList: Branch[] = [];
  cols: ICol[] = [
    {
      field: "branchName",
      header: dictionary.Name,
      width: "auto",
      hidden: false,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "BranchRead",
    },
    {
      field: "priceList",
      header: dictionary.PriceList,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "BranchRead",
      width: "auto",
      hidden: false,
    },
    {
      field: "rootPriceListId",
      header: dictionary.Empty,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "BranchRead",
      width: "auto",
      hidden: false,
    },
  ];
  loading = false;
  openNewBranch = false;
  branchId: number;
  getSubBranches$ = new Subscription();
  createBranches$ = new Subscription();
  openAssignPriceListModal = false;
  selectedBranch = new Branch();
  initPage$ = new Subscription();
  parentPriceListId: number;
  priceLists: PriceList[] = [];
  assignPriceListModalTitle: string | undefined;
  assignedPriceListId: number | undefined;
  page = 1;
  pageSize = 10;
  branchListSearch: string = "";
  showPage = false;
  branch: Branch | undefined;

  constructor(
    private branchesClient: BranchesClient,
    private priceListsClient: PriceListsClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private storageService: StorageService,
    private teamClient: TeamClient
  ) {
    this.branchId = coreService.getBranchId()!;
    this.parentPriceListId = this.layoutService.getParentPriceListId();
    this.layoutService.setTabName(dictionary.Branches);
    this.layoutService.checkPagePermission("BranchRead");
  }

  ngOnInit() {
    this.initPage();
  }

  onFocusBranch(branch: Branch): void {
    this.branch = branch;
    this.storageService.set("defaultBranch", this.branch.branchId);
    this.layoutService.updateBranch(this.branch);
    location.href = `${location.origin}/branches/${branch.branchId}/price-lists`;
  }

  showAndReturnToApp(): void {
    if (this.layoutService.getDeviceMode() === "desktop") {
      location.href = `${location.origin}/branches/${this.branch?.branchId}/shop`;
    } else {
      location.href = `${location.origin}/branches/${this.branch?.branchId}/eGift`;
    }
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      branches: this.branchesClient.getSubBranches(this.branchId),
      priceLists: this.priceListsClient.get(
        this.branchId,
        this.parentPriceListId
      ),
    }).subscribe((data) => {
      this.loading = false;
      this.initPriceLists(data.priceLists);
      this.page = 1;
      this.initBranches(data.branches);
      this.showPage = true;
    });
  }

  initPriceLists(data: PriceList): void {
    this.priceLists = [];
    this.priceLists.push(data);
    data.priceLists?.forEach((item) => {
      this.priceLists.push(item);
    });
  }

  initBranches(branches: Branch[]): void {
    if (branches.length == 0) this.router.navigate(["/forbidden"]);
    let branchList: any;
    branchList = branches.map((branch) => ({
      ...branch,
      priceList: this.getPriceList(branch.assignedPriceList?.priceListId!)
        ?.priceListName,
      rootPriceListId: dictionary.AddExceptionToPriceList,
    }));

    this.branchList = branchList.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
    this.allBranchList = branchList;
  }

  getPriceList(id: number): PriceList | undefined {
    const data = this.priceLists.find((p) => p.priceListId == id);
    if (data) return data;
    return undefined;
  }

  createBranch(data: CreateBranchRequest): void {
    const resData = new Branch();
    this.loadingService.present();
    this.createBranches$ = this.branchesClient
      .create(data.branchId!, data.branchName!, data.description)
      .subscribe({
        next: (res: BranchLight) => {
          resData.init(res);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `branch "${resData.branchName}" added successfully`
          );
          this.initPage();
        },
      });
  }

  onlinkRowClick(row: ILinkRow): void {
    if (row.colName === dictionary.Name) {
      this.onFocusBranch(row.data);
    } else if (row.colName === dictionary.PriceList) {
      this.onAssignPriceListClick(row.data);
    } else {
      this.onAddExceptionClick(row.data);
    }
  }

  onAddExceptionClick(data: Branch): void {
    const assignPriceList = this.getPriceList(
      data.assignedPriceList?.priceListId!
    )?.priceListName;
    this.router.navigate(
      [`/branches/${this.branchId}/price-lists/customer-price-list/prices`],
      {
        relativeTo: this.activatedRoute,
        queryParams: {
          id: data.middlePriceList?.priceListId,
          priceList: assignPriceList,
          branch: data.branchName,
        },
        queryParamsHandling: "merge",
      }
    );
  }

  onAssignPriceListClick(data: Branch): void {
    this.selectedBranch.init(data);
    this.assignPriceListModalTitle = `${dictionary.AssignPriceList} to office "${data.branchName}"`;
    this.assignedPriceListId = data.assignedPriceList?.priceListId!;
    this.openAssignPriceListModal = true;
  }

  assignPriceListInCustomer(data: { id: number; name: string }): void {
    this.loadingService.present();
    this.branchesClient
      .assignPriceList(this.branchId, data.id, this.selectedBranch.branchId)
      .subscribe({
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `assign price list "${data.name}" to branch "${this.selectedBranch.branchName}" successfully`
          );
          this.initPage();
        },
      });
  }

  onRefreshClick(): void {
    this.initPage();
  }

  onExcelExportClick(): void {
    const exportData = [...this.allBranchList]
      .filter((x) =>
        x.branchName
          .toLocaleLowerCase()
          .includes(this.branchListSearch.toLocaleLowerCase())
      )
      .map((branch) => ({
        branchName: branch.branchName,
        branchId: branch.branchId,
      }));
    this.coreService.exportExcel(exportData, "branches");
  }

  initLocalBranchList(page: number, query: string) {
    this.page = page;
    if (query.trim().length > 0) {
      this.branchListSearch = query;
      this.branchList = [...this.allBranchList]
        .filter((x) =>
          x.branchName
            .toLocaleLowerCase()
            .includes(this.branchListSearch.toLocaleLowerCase())
        )
        .slice((page - 1) * this.pageSize, page * this.pageSize);
    } else {
      this.branchListSearch = "";
      this.branchList = [...this.allBranchList].slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
    }
  }

  ngOnDestroy(): void {
    this.getSubBranches$.unsubscribe();
    this.createBranches$.unsubscribe();
    this.initPage$.unsubscribe();
  }
}
