// noinspection JSUnusedLocalSymbols

import { Component, OnDestroy, OnInit } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Branch, BranchesClient } from "@app/proxy/proxy";
import { IMultiSelectModalData } from "@app/shared/components";
import {
  ICol,
  ILinkRow,
} from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";
import {ResponseErrorDto} from "@core/dto/core.dto";

@Component({
  selector: "app-gateway-list",
  templateUrl: "./gateway-list.component.html",
  styleUrls: ["./gateway-list.component.scss"],
})
export class GatewayListComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  gatewayList: any[] = [
    {
      name: "Test",
      customer: dictionary.AssignToCustomer,
    },
    {
      name: "test2",
      customer: dictionary.AssignToCustomer,
    },
  ];
  customers: Branch[] = [];
  initPage$ = new Subscription();
  loading = false;
  openMultiSelectCustomerModal = false;
  cols: ICol[] = [
    {
      field: "name",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      width: "auto",
      hidden: false,
    },
    {
      field: "customer",
      header: dictionary.Empty,
      hasLinkRow: true,
      isRouteLink: false,
      width: "auto",
      hidden: false,
    },
  ];
  openNewGateway = false;
  openEditGateway = false;
  branchId: number;
  editGatewayModalTitle: string | undefined;

  constructor(
    private coreService: CoreService,
    private branchesClient: BranchesClient,
    private layoutService: LayoutService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.layoutService.setTabName(dictionary.GateWayList);
  }

  ngOnInit() {
    this.initPage();
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      customers: this.branchesClient.getSubMerchants(this.branchId, null, null, false),
    }).subscribe({
      next: (res) => {
        this.customers = res.customers;
        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }

  onRefreshClick(): void {}
  onExcelExportClick(): void {}
  onlinkRowClick(row: ILinkRow): void {
    if (row.colName === dictionary.Name) {
      this.onEditGatewayClick(row.data);
    } else {
      this.openMultiSelectCustomerModal = true;
    }
  }
  onEditGatewayClick(data: any) {
    this.editGatewayModalTitle = `${dictionary.Edit} ${data.name}`;
    this.openEditGateway = true;
  }
  confirmMultiSelectProfilesModal(data: IMultiSelectModalData): void {}
  newGatewayClick(): void {}
  editGatewayClick(): void {}

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
