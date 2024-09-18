// noinspection JSIgnoredPromiseFromCall

import { HttpParams } from "@angular/common/http";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  NotificationService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { CustomerService } from "@app/modules/customer/service/customer.service";
import {
  AuthenticationClient,
  Branch,
  BranchesClient,
  FinancialClient,
  FinancialOrder,
  FinancialOrderState,
  FinancialOrderType,
  User,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import { ICol } from "@shared/components/page-list/page-list.model";
import { Subscription, combineLatest } from "rxjs";
import {
  IWalletOrdersTags,
  WalletOrdersFilterDto,
} from "../../dto/financial.dto";

@Component({
  selector: "app-financial-activities",
  templateUrl: "./financial-activities.component.html",
  styleUrls: ["./financial-activities.component.scss"],
})
export class FinancialActivitiesComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  cols: ICol[] = [
    {
      field: "orderId",
      header: dictionary.Id,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "createdTime",
      header: dictionary.CreatedTime,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "financialOrderType",
      header: dictionary.Type,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "amount",
      header: dictionary.Amount,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "customer",
      header: dictionary.Customer,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "financialOrderState",
      header: dictionary.State,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
  ];
  clientProfile = new User();
  financialActivities: FinancialOrder[] = [];
  openFinancialActivitiesFilter: boolean = false;
  page = 1;
  pageSize = 10;
  merchantId = 0;
  getFinancialActivities$ = new Subscription();
  branchId: number | undefined;
  financialActivitiesFilter = new WalletOrdersFilterDto();
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  customers: Branch[] = [];
  customer: Branch | undefined;
  hiddenCustomerInput = false;
  branch: Branch;
  openFinancialActivitiesDetail = false;
  financialActivity: FinancialOrder | undefined;

  @Input() customerId: number | undefined;

  constructor(
    private coreService: CoreService,
    private financialClient: FinancialClient,
    private branchesClient: BranchesClient,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private customerService: CustomerService,
    private titleService: Title,
    private authenticationClient: AuthenticationClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;
    this.branch = this.layoutService.getBranch(this.branchId)!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.EndTime) {
        this.financialActivitiesFilter.end = undefined;
      }
      if (tagsKey == dictionary.BeginTime) {
        this.financialActivitiesFilter.from = undefined;
      }
      if (tagsKey == dictionary.Customer) {
        this.financialActivitiesFilter.customerMerchantId = undefined;
      }
      if (tagsKey == dictionary.Type) {
        this.financialActivitiesFilter.walletOrderType = undefined;
      }
      if (tagsKey == dictionary.State) {
        this.financialActivitiesFilter.walletOrderState = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.financialActivitiesFilter);
      this.getFinancialActivities(this.financialActivitiesFilter);
    });
    this.layoutService.checkPagePermission("FinancialRead");
  }

  ngOnInit() {
    if (this.branch.merchant?.financialActivitiesTwoPhaseVerification) {
      this.cols.push({
        field: "state",
        header: dictionary.Empty,
        hasNormalRow: true,
        width: "auto",
        hidden: false,
      });
    }
    this.cols.push(
      {
        width: "auto",
        field: "approve",
        header: dictionary.Empty,
        hidden: false,
      },
      {
        width: "auto",
        field: "reject",
        header: dictionary.Empty,
        hidden: false,
      }
    );
    this.initTitle();
    this.initBreadcrumbs();
    this.initWalletOrdersFilterFromUrlParams();
    this.initFinancialActivities(this.financialActivitiesFilter);
  }
  initBreadcrumbs() {
    if (this.router.url.includes("customer")) {
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
  }
  initTitle() {
    if (!this.router.url.includes("customer")) {
      this.titleService.setTitle(
        `${dictionary.FinancialActivities} - ${dictionary.Financial} - ${this.layoutService.branchName}`
      );
    }
  }

  initWalletOrdersFilterFromUrlParams(): void {
    const params = this.getUrlParams();
    if (params) {
      if (params.customerMerchantId) {
        this.customer = this.customers.find(
          (x) => x.merchantId == Number(params.customerMerchantId)
        );
      }
      this.financialActivitiesFilter.init({
        end: params.end,
        from: params.from,
        customerMerchantId: this.customer
          ? this.customer.merchantId
          : undefined,

        walletOrderType: params.walletOrderType
          ? (params.walletOrderType as FinancialOrderType)
          : undefined,

        walletOrderState: params.walletOrderState
          ? (params.walletOrderState as FinancialOrderState)
          : undefined,
        pageNumber: this.page,
        pageSize: this.pageSize,
      });
    }
    if (this.customerId) {
      this.financialActivitiesFilter.customerMerchantId = this.customerId;
      this.hiddenCustomerInput = true;
    }
    this.financialActivitiesFilter.walletOrderState =
      FinancialOrderState.Unverified;
    this.updateRouteParameters(this.financialActivitiesFilter);
  }

  initFinancialActivities(filter: WalletOrdersFilterDto): void {
    const me = this;
    this.loading = true;
    this.getFinancialActivities$ = combineLatest({
      orders: this.financialClient.getFinancialOrders(
        this.branchId!,
        filter.customerMerchantId,
        filter.walletOrderType,
        filter.walletOrderState,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.pageSize,
        this.page
      ),
      customers: this.branchesClient.getSubMerchants(
        this.branchId!,
        null,
        null,
        false
      ),
      currenctUser: this.authenticationClient.getCurrentUser(),
    }).subscribe({
      next(data) {
        me.loading = false;
        me.financialActivities = data.orders;
        me.customers = data.customers;
        me.clientProfile = data.currenctUser;
        me.createTagFromUrlParams();
        me.page = 1;
      },
      error: (error: ResponseErrorDto) => {
        me.loading = false;
        throw Error(error.message);
      },
    });
  }

  getFinancialActivities(filter: WalletOrdersFilterDto): void {
    const me = this;
    this.loading = true;
    this.financialActivities = [];
    this.getFinancialActivities$ = this.financialClient
      .getFinancialOrders(
        this.branchId!,
        filter.customerMerchantId,
        filter.walletOrderType,
        filter.walletOrderState,
        filter.from ? new Date(filter.from) : undefined,
        filter.end ? new Date(filter.end) : undefined,
        this.pageSize,
        this.page
      )
      .subscribe({
        next(data) {
          me.loading = false;
          me.financialActivities = data;
          me.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          me.loading = false;
          throw Error(error.message);
        },
      });
  }

  getUrlParams(): IWalletOrdersTags | undefined {
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });

    const customerMerchantId = Number(httpParams.get("customerMerchantId")!);
    const from = httpParams.get("from")!;
    const end = httpParams.get("end")!;
    const walletOrderType = httpParams.get("walletOrderType")!;
    const walletOrderState = httpParams.get("walletOrderState")!;

    let tags: IWalletOrdersTags;
    tags = {
      customerMerchantId,
      from,
      end,
      walletOrderType,
      walletOrderState,
    };

    return tags;
  }

  updateRouteParameters(filter: WalletOrdersFilterDto) {
    const params: Params = {
      from: filter.from,
      end: filter.end,
      customerMerchantId: filter.customerMerchantId,
      walletOrderType: filter.walletOrderType,
      walletOrderState: filter.walletOrderState,
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

  createTags(data: IWalletOrdersTags): void {
    let tags: ITag[];
    const end: ITag = {
      key: dictionary.EndTime,
      value: data.end
        ? new Date(data.end).toISOString().split("T")[0]
        : undefined,
      clearable: true,
    };

    const from: ITag = {
      key: dictionary.BeginTime,
      value: data.from
        ? new Date(data.from).toISOString().split("T")[0]
        : undefined,
      clearable: true,
    };

    this.customer = this.customers.find(
      (x) => x.merchantId === Number(data.customerMerchantId)
    );
    const merchant: ITag = {
      key: dictionary.Customer,
      value:
        data.customerMerchantId && !!this.customer
          ? this.customer.merchantName
          : undefined,
      clearable: true,
    };

    let walletOrderType;

    switch (data.walletOrderType) {
      case "Charge":
        walletOrderType = FinancialOrderType["Charge"];
        break;

      case "Withdraw":
        walletOrderType = FinancialOrderType["Withdraw"];
        break;

      case "Credit":
        walletOrderType = FinancialOrderType["Credit"];
        break;

      case "Settle":
        walletOrderType = FinancialOrderType["Settle"];
        break;
      case "Rebate":
        walletOrderType = FinancialOrderType["Rebate"];
        break;
      default:
        walletOrderType = undefined;
        break;
    }

    const walletOrderTypeTag: ITag = {
      key: dictionary.Type,
      value:
        data.walletOrderType && !!walletOrderType ? walletOrderType : undefined,
      clearable: true,
    };

    let walletOrderState;

    switch (data.walletOrderState) {
      case "Unverified":
        walletOrderState = FinancialOrderState.Unverified;
        break;

      case "Completed":
        walletOrderState = FinancialOrderState.Completed;
        break;

      case "Failed":
        walletOrderState = FinancialOrderState.Failed;
        break;

      default:
        walletOrderType = undefined;
        break;
    }

    const walletOrderStateTag: ITag = {
      key: dictionary.State,
      value:
        data.walletOrderState && !!walletOrderState
          ? walletOrderState
          : undefined,
      clearable: true,
    };

    if (this.customerId) {
      tags = [end, from, walletOrderTypeTag, walletOrderStateTag];
    } else {
      tags = [end, from, merchant, walletOrderTypeTag, walletOrderStateTag];
    }

    this.tagService.createTags(tags);
  }

  onRefreshClick(): void {
    this.getFinancialActivities(this.financialActivitiesFilter);
  }

  onLinkRowClickClick(row: FinancialOrder): void {
    this.financialActivity = row;
    this.openFinancialActivitiesDetail = true;
  }

  showButtonCondition(rowData: FinancialOrder): boolean {
    if (
      rowData.financialOrderState === "Unverified" &&
      rowData.firstVerifierUserEmail !== this.clientProfile.email &&
      rowData.secondVerifierUserEmail !== this.clientProfile.email &&
      (rowData.firstVerifierUserEmail === null ||
        rowData.secondVerifierUserEmail === null)
    ) {
      return true;
    } else {
      return false;
    }
  }

  onExcelExportClick(): void {
    // this.loading = true;
    this.loadingService.present();
    this.getFinancialActivities$ = this.financialClient
      .getFinancialOrders(
        this.branchId!,
        this.financialActivitiesFilter.customerMerchantId,
        this.financialActivitiesFilter.walletOrderType,
        this.financialActivitiesFilter.walletOrderState,
        this.financialActivitiesFilter.from
          ? new Date(this.financialActivitiesFilter.from)
          : undefined,
        this.financialActivitiesFilter.end
          ? new Date(this.financialActivitiesFilter.end)
          : undefined,
        undefined,
        -1
      )
      .subscribe({
        next: (res: FinancialOrder[]) => {
          let financialList = res.map((financial) => ({
            currencyName: financial.currency.currencyName,
            currencyId: financial.currency.currencyId,
            baseMerchantName: financial.baseMerchant.merchantName,
            baseMerchantId: financial.baseMerchant.merchantId,
            targetMerchantName: financial.targetMerchant.merchantName,
            targetMerchantId: financial.targetMerchant.merchantId,
            orderId: financial.orderId,
            amount: financial.amount,
            financialOrderType: financial.financialOrderType,
            financialOrderState: financial.financialOrderState,
            createdTime: financial.createdTime,
            description: financial.description,
          }));
          this.coreService.exportExcel(
            financialList,
            dictionary.FinancialActivities
          );
        },
        error: (error: ResponseErrorDto) => {
          // this.loading = false;
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          // this.loading = false;
          this.loadingService.dismiss();
        },
      });
  }

  async approveOrder(data: FinancialOrder) {
    const walletOrderApproveAlert = await this.alertController.create({
      header: dictionary.Verify,
      message: `
        You are verifying a request with the following details, are you sure?<br/><br />
        <span><span class="text-value">${dictionary.Id}:</span> ${
        data.orderId
      }</span><br />
       <span><span class="text-value">${dictionary.Amount}:</span> 
          ${data.currency.symbol} ${data.amount.toLocaleString()}
        </span><br />
        <span><span class="text-value">${dictionary.Type}:</span> ${
        data.financialOrderType
      }</span><br />
        <span><span class="text-value">${dictionary.Customer}:</span> ${
        data["baseMerchant"].merchantId !== this.merchantId
          ? data["baseMerchant"].merchantName + " " + `(${dictionary.Sender})`
          : ""
      }
          ${
            data["targetMerchant"].merchantId !== this.merchantId
              ? data["targetMerchant"].merchantName +
                " " +
                `(${dictionary.Receiver})`
              : ""
          }</span><br />
        <span><span class="text-value">${dictionary.Initiator}:</span>
          ${data.firstVerifierUserEmail}
        </span><br />
        <span class="${
          data.financialOrderType !== FinancialOrderType.Charge ? "d-none" : ""
        }">
          <span class="text-value">${dictionary.Bank}:</span>
          <span>${data.bank?.bankName ? data.bank?.bankName : "-"}</span>
        </span>
        <span><br /><span class="text-value">${dictionary.Description}:</span>
         ${data.description}
        </span>
        
        `,
      animated: false,
      cssClass: "deletePrice__alert",
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          id: dictionary.Verify,
          text: dictionary.Verify,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            this.loadingService.present();
            this.financialClient
              .verify(this.branchId!, data.financialOrderType, data?.orderId)
              .subscribe({
                next: (res) => {
                  this.getFinancialActivities(this.financialActivitiesFilter);
                  this.loadingService.dismiss();
                  this.notificationService.showSuccessNotification(
                    `Request id ${data.orderId} approved.`
                  );
                },
                error: async (error: ResponseErrorDto) => {
                  this.getFinancialActivities(this.financialActivitiesFilter);
                  this.loadingService.dismiss();
                  this.notificationService.showErrorAlertNotification(
                    error.message!
                  );
                },
              });
          },
        },
      ],
    });

    await walletOrderApproveAlert.present();
  }

  async rejectOrder(data: FinancialOrder) {
    const walletOrderApproveAlert = await this.alertController.create({
      header: dictionary.Reject,
      message: `
        You are rejecting a request with the following details, are you sure?<br/><br />
        <span><span class="text-value">${dictionary.Id}:</span> ${
        data.orderId
      }</span><br />
        <span><span class="text-value">${dictionary.Amount}:</span> 
          ${data.currency.symbol} ${data.amount.toLocaleString()}
        </span><br />
        <span><span class="text-value">${dictionary.Type}:</span> ${
        data.financialOrderType
      }</span><br />
      <span><span class="text-value">${dictionary.Customer}:</span> ${
        data["baseMerchant"].merchantId !== this.merchantId
          ? data["baseMerchant"].merchantName + " " + `(${dictionary.Sender})`
          : ""
      }
          ${
            data["targetMerchant"].merchantId !== this.merchantId
              ? data["targetMerchant"].merchantName +
                " " +
                `(${dictionary.Receiver})`
              : ""
          }</span><br />
        <span><span class="text-value">${dictionary.Initiator}:</span>
          ${data.firstVerifierUserEmail}
        </span><br />
        <span class="${
          data.financialOrderType !== FinancialOrderType.Charge ? "d-none" : ""
        }">
          <span class="text-value">${dictionary.Bank}:</span>
          <span>${data.bank?.bankName ? data.bank?.bankName : "-"}</span>
        </span>
        <span><br /><span class="text-value">${dictionary.Description}:</span>
         ${data.description}
        </span>
        `,
      animated: false,
      cssClass: "deletePrice__alert",
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          id: dictionary.Reject,
          text: dictionary.Reject,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            this.loadingService.present();
            this.financialClient
              .reject(this.branchId!, data.financialOrderType, data?.orderId)
              .subscribe({
                next: (res) => {
                  this.getFinancialActivities(this.financialActivitiesFilter);
                  this.loadingService.dismiss();
                  this.notificationService.showSuccessNotification(
                    `Request id ${data.orderId} rejected.`
                  );
                },
                error: async (error: ResponseErrorDto) => {
                  this.getFinancialActivities(this.financialActivitiesFilter);
                  this.loadingService.dismiss();
                  this.notificationService.showErrorAlertNotification(
                    error.message!
                  );
                },
              });
          },
        },
      ],
    });

    await walletOrderApproveAlert.present();
  }

  saveFinancialActivitiesFilter(filter: WalletOrdersFilterDto) {
    this.openFinancialActivitiesFilter = false;
    this.page = 1;
    this.financialActivitiesFilter.init(filter);
    this.updateRouteParameters(filter);
    this.getFinancialActivities(this.financialActivitiesFilter);
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.financialActivitiesFilter.pageNumber = data.page;
    this.getFinancialActivities(this.financialActivitiesFilter);
  }

  ngOnDestroy(): void {
    this.getFinancialActivities$.unsubscribe();
    this.changeTagList$.unsubscribe();
    this.removeTag$.unsubscribe();
  }
}
