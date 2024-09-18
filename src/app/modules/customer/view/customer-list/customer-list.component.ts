// noinspection JSIgnoredPromiseFromCall

import { HttpParams } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, IPageChange, ITag, TagService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  BranchesClient,
  GatewayList,
  GatewayListsClient,
  PriceList,
  PriceListsClient,
  SaleManager,
  SaleManagersClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { SortEvent } from "primeng/api";
import { Subscription, combineLatest } from "rxjs";
import {
  CustomerFilterDto,
  ICustomerFilterDto,
  ICustomersTagFilter,
} from "../../dto/customer.dto";

@Component({
  selector: "app-customer-list",
  templateUrl: "./customer-list.component.html",
  styleUrls: ["./customer-list.component.scss"],
})
export class CustomerListComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  cols = [
    {
      field: "merchantId",
      header: dictionary.Id,
    },
    {
      field: "merchantName",
      header: dictionary.Name,
    },
    {
      field: "priceList",
      header: dictionary.PriceList,
    },
    {
      field: "gatewayList",
      header: dictionary.GatewayList,
    },
    {
      field: "saleManager",
      header: dictionary.SaleManager,
    },
    {
      width: "auto",
      hidden: false,
      field: "isActive",
      hasLinkRow: true,
      linkRowPermission: "CustomerRead",
      header: dictionary.Status,
    },
  ];
  customers: Branch[] = [];
  customersTemp: Branch[] = [];
  loading = false;
  branchId: number;
  parentPriceListId: number;
  priceLists: PriceList[] = [];
  initPage$ = new Subscription();
  openCustomerFilterModal: boolean = false;
  branchName: string | undefined;
  page = 1;
  pageSize = 10;
  filterCustomer = new CustomerFilterDto();
  searchCriteria: string | undefined;
  getCustomersSub$ = new Subscription();
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  tagList: ITag[] = [];
  exportExcelData: Branch[] = [];
  searchCustomer: string = "";
  lastPageNumber = 0;
  exportData: any[] = [];
  gatewayLists: GatewayList[] = [];
  saleManagers: SaleManager[] = [];

  constructor(
    private branchesClient: BranchesClient,
    private priceListsClient: PriceListsClient,
    private coreService: CoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService,
    private tagService: TagService,
    private gatewayListsClient: GatewayListsClient,
    private saleManagersClient: SaleManagersClient
  ) {
    this.branchId = coreService.getBranchId()!;
    this.parentPriceListId = this.layoutService.getParentPriceListId();
    this.layoutService.setTabName(dictionary.Customers);
    this.layoutService.checkPagePermission("CustomerRead");

    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.PriceList) {
        this.filterCustomer.priceListId = undefined;
      }
      if (tagsKey == dictionary.GateWayList) {
        this.filterCustomer.gatewayListId = undefined;
      }
      if (tagsKey == dictionary.SaleManager) {
        this.filterCustomer.saleManagerId = undefined;
      }
      this.page = 1;
      this.updateRouteParameters(this.filterCustomer);
      this.fillLocalCustomers({ page: 1, pageSize: this.pageSize });
    });
  }

  ngOnInit() {
    const params = this.getUrlParams();
    if (params) {
      this.filterCustomer.init({
        priceListId: params.priceListId
          ? Number(params.priceListId)
          : undefined,
        gatewayListId: params.gatewayListId
          ? Number(params.gatewayListId)
          : undefined,
        saleManagerId: params.saleManagerId
          ? Number(params.saleManagerId)
          : undefined,
      });
    }
    this.initPage();
  }
  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      customers: this.branchesClient.getSubMerchants(
        this.branchId,
        null,
        null,
        false,
        null,
        null,
        -1,
        null
      ),
      priceLists: this.priceListsClient.get(
        this.branchId,
        this.parentPriceListId
      ),
      gatewayLists: this.gatewayListsClient.getGatewayLists(this.branchId),
      saleManagers: this.saleManagersClient.getSaleManagers(this.branchId),
    }).subscribe((data) => {
      this.loading = false;
      this.initPriceLists(data.priceLists, data.customers);
      this.initGatewayLists(data.gatewayLists);
      this.initSaleManagers(data.saleManagers);
      this.createTagFromUrlParams();
    });
  }
  initPriceLists(data: PriceList, customers: Branch[]): void {
    this.priceLists = [];
    this.priceLists.push(data);
    data.priceLists?.forEach((item) => {
      this.priceLists.push(item);
    });
    this.initCustomer(customers);
  }
  initCustomer(data: Branch[]): void {
    data.forEach((customer) => {
      const priceList = this.priceLists.find(
        (p) => p.priceListId == customer.assignedPriceList?.priceListId
      );
      if (!priceList) return;
      customer.assignedPriceList!.priceListName = priceList.priceListName;
    });
    this.customers = data;
    this.customersTemp = data;
    this.fillLocalCustomers({ page: 1, pageSize: this.pageSize });
  }
  initGatewayLists(data: GatewayList[]): void {
    this.gatewayLists = data;
  }
  initSaleManagers(data: SaleManager[]): void {
    this.saleManagers = data;
  }
  mapIsActiveStatus(status: boolean) {
    return status ? dictionary.Active : dictionary.Deactive;
  }

  onLinkRowClickClick(row: any): void {
    this.onCustomerNameClick(row);
  }
  redirectToCreatePage() {
    this.router.navigate([`/branches/${this.branchId}/customers/create`]);
  }
  onCustomerNameClick(data: Branch): void {
    const url = `/branches/${this.branchId}/customers/${data.merchantId}/price-list`;
    this.router.navigate([url], {
      relativeTo: this.activatedRoute,
      queryParams: {},
      queryParamsHandling: "merge",
    });
  }

  onRefreshClick(): void {
    this.getCustomers();
  }
  onExcelExportClick(): void {
    this.coreService.exportExcel(this.exportData, "customers");
  }
  saveFilterCustomer(filter: ICustomerFilterDto): void {
    this.openCustomerFilterModal = false;
    this.filterCustomer.init(filter);
    this.updateRouteParameters(filter);
    this.fillLocalCustomers({ page: 1, pageSize: this.pageSize });
    const tags: ICustomersTagFilter = {
      gatewayListId: String(filter.gatewayListId!),
      priceListId: String(filter.priceListId!),
      saleManagerId: String(filter.saleManagerId!),
    };
    this.createTags(tags);
  }
  getCustomers() {
    this.loading = true;
    this.getCustomersSub$ = this.branchesClient
      .getSubMerchants(this.branchId, null, null, false, null, null, -1, null)
      .subscribe({
        next: (res) => {
          this.initCustomer(res);
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

  updateRouteParameters(filter: ICustomerFilterDto) {
    const params: Params = {
      pariceListId: filter.priceListId,
      saleManagerId: filter.saleManagerId,
      gatewayListId: filter.gatewayListId,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params) this.createTags(params);
  }
  getUrlParams(): ICustomersTagFilter | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });

    const priceListId = httpParams.get("pariceListId")!;
    const gatewayListId = httpParams.get("gatewayListId")!;
    const saleManagerId = httpParams.get("saleManagerId")!;

    let tags: ICustomersTagFilter;
    tags = {
      priceListId,
      gatewayListId,
      saleManagerId,
    };

    return tags;
  }
  createTags(data: ICustomersTagFilter): void {
    let tags: ITag[];

    const priceListTag: ITag = {
      key: dictionary.PriceList,
      value: this.getPriceList(Number(data.priceListId))?.priceListName!,
      clearable: true,
    };

    const saleManagerTag: ITag = {
      key: dictionary.SaleManager,
      value: this.saleManagers.find(
        (s) => s.saleManagerId == Number(data.saleManagerId)
      )?.name,
      clearable: true,
    };

    const gateWayListTag: ITag = {
      key: dictionary.GateWayList,
      value: this.gatewayLists.find(
        (g) => g.gatewayListId == Number(data.gatewayListId)
      )?.name,
      clearable: true,
    };

    tags = [priceListTag, saleManagerTag, gateWayListTag];
    this.tagService.createTags(tags);
  }

  getPriceList(id: number): PriceList | undefined {
    const data = this.priceLists.find((p) => p.priceListId == id);
    if (data) return data;
    return undefined;
  }

  onInputSearch(query: string | undefined) {
    this.searchCriteria = query;
    this.fillLocalCustomers({ page: 1, pageSize: this.pageSize });
  }

  fillLocalCustomers(data: IPageChange): void {
    this.page = data.page;
    let temp = this.customersTemp;
    this.lastPageNumber = Math.ceil(this.customersTemp.length / this.pageSize);

    temp = this.search(temp, this.searchCriteria);

    temp = this.filter(temp, this.filterCustomer);

    this.exportData = temp.map((customer) => ({
      ...customer,
      id: customer.merchantId,
      name: customer.merchantName,
      priceList: customer.assignedPriceList?.priceListName,
      gatewayList: customer.merchant?.assignedGatewayList?.name,
    }));

    this.customers = temp.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
  }
  search(data: Branch[], query: string | undefined): Branch[] {
    if (query) {
      data = data.filter(
        (d) =>
          d.merchantName
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()) ||
          d.merchantId == Number(query)
      );
    }
    return data;
  }
  filter(data: Branch[], filter: ICustomerFilterDto): Branch[] {
    if (filter.priceListId) {
      data = data.filter(
        (d) => d.assignedPriceList?.priceListId == filter.priceListId
      );
    }
    if (filter.gatewayListId) {
      data = data.filter(
        (d) =>
          d.merchant?.assignedGatewayList?.gatewayListId == filter.gatewayListId
      );
    }
    if (filter.saleManagerId) {
      data = data.filter(
        (d) => d.merchant?.saleManager?.saleManagerId == filter.saleManagerId
      );
    }
    return data;
  }
  sort(event: SortEvent): Branch[] | undefined {
    const field = event.field;
    return event.data?.sort((d1: Branch, d2: Branch) => {
      let result = null;

      if (field === "merchantName") {
        let v1 = d1.merchantName;
        let v2 = d2.merchantName;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1.localeCompare(v2);
      }

      if (field === "priceList") {
        let v1 = d1.assignedPriceList?.priceListName;
        let v2 = d2.assignedPriceList?.priceListName;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1?.localeCompare(v2!);
      }

      if (field === "gatewayList") {
        let v1 = d1.merchant?.assignedGatewayList?.name;
        let v2 = d2.merchant?.assignedGatewayList?.name;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1?.localeCompare(v2!);
      }

      if (field === "saleManager") {
        let v1 = d1.merchant?.saleManager?.name;
        let v2 = d2.merchant?.saleManager?.name;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1?.localeCompare(v2!);
      }

      if (field === "isActive") {
        let v1 = d1.merchant?.isActive
          ? dictionary.Activate
          : dictionary.Deactive;
        let v2 = d2.merchant?.isActive
          ? dictionary.Activate
          : dictionary.Deactive;

        result = v1?.localeCompare(v2!);
      }

      return event.order! * result!;
    });
  }

  pageSizeChange(event: number): void {
    this.pageSize = event == 0 ? this.customersTemp.length : event;
    this.fillLocalCustomers({
      page: 1,
      pageSize: this.pageSize,
    });
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.getCustomersSub$.unsubscribe();
  }
}
