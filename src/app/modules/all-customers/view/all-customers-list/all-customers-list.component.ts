import { Component, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import {
  Branch,
  BranchLight,
  Merchant,
  MerchantsClient,
  PatchOfNullableBoolean,
  SystemClient,
  UpdateMerchantSettingRequest
} from "@app/proxy/proxy";
import {
  ICol,
  IToggleRow,
} from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";

@Component({
  selector: "app-all-customers-list",
  templateUrl: "./all-customers-list.component.html",
  styleUrls: ["./all-customers-list.component.scss"],
})
export class AllCustomersListComponent implements OnInit {
  dictionary = dictionary;
  loading: boolean = false;
  cols: ICol[] = [
    {
      field: "merchantName",
      header: dictionary.Name,
      width: "auto",
      hasNormalRow: true,
      hidden: false,
    },
    {
      field: "canCreatePaymentOrder",
      header: dictionary.Payment,
      width: "auto",
      hasToggleRow: true,
      hidden: false,
    },
    {
      field: "isActive",
      header: dictionary.Status,
      width: "auto",
      hasStatusRow: true,
      hidden: false,
    },
  ];
  page: number = 1;
  pageSize: number = 12;
  searchCriteria: string | undefined;
  allCustomers: BranchLight[] = [];

  constructor(
    private coreService: CoreService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private merhcantClient: MerchantsClient,
    private notificationService: NotificationService,
    private systemClient: SystemClient
  ) { }

  ngOnInit() {
    this.getAllCustomers();
  }

  getAllCustomers() {
    this.loading = true;
    this.systemClient.getRootBranches(this.searchCriteria, this.page, this.pageSize)
      .subscribe({
        next: (response: BranchLight[]) => {
          this.allCustomers = response.map(branch => ({
            ...branch,
            isActive: branch.merchant?.isActive
          }) as BranchLight); // the isActive was changed with merchant isActive
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

  onRefreshClick() {
    this.page = 1;
    this.getAllCustomers();
  }

  onExcelExportClick() {
    this.loadingService.present();
    this.systemClient.getRootBranches(this.searchCriteria, -1, undefined)
      .subscribe({
        next: (res: BranchLight[]) => {
          let exportedCustomer = res.map((item) => ({
            branchId: item.branchId,
            branchName: item.branchName,
            merchantId: item.merchantId,
            merchantName: item.merchantName,
            parentBranchId: item.parentBranchId,
            description: item.description,
            isActive: item.isActive,
            rootPriceListId: item.rootPriceListId,
            canSetFaceValue: item.canSetFaceValue,
            canSetBuyValue: item.canSetBuyValue,
            canCreatePaymentOrder: item.canCreatePaymentOrder,
            canPlaceOrder: item.canPlaceOrder,
          }));
          this.coreService.exportExcel(exportedCustomer, "allcustomer");
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  onToggleClick(data: IToggleRow) {
    this.onLogoutClick(data.data);
  }

  pageChanged(data: IPageChange) {
    this.page = data.page;
    this.getAllCustomers();
  }

  async onLogoutClick(data: Branch) {
    const alert = await this.alertController.create({
      header: dictionary.CanCreatePayment,
      message: `Are you sure you want to ${data.canCreatePaymentOrder ? "deactive" : "active"
        } <b>${data.merchantName}</b> pay creation?`,
      animated: false,
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: data.canCreatePaymentOrder
            ? dictionary.Deactive
            : dictionary.Active,
          role: "confirm",
          cssClass: data.canCreatePaymentOrder
            ? "danger-alert-btn"
            : "primary-alert-btn",
          handler: () => {
            this.onTogglePayment(data);
          },
        },
      ],
    });

    await alert.present();
  }

  onTogglePayment(branch: Branch) {
    this.loading = true;
    const request = new UpdateMerchantSettingRequest();
    let canCreatePaymentOrderStatus = new PatchOfNullableBoolean();
    canCreatePaymentOrderStatus.value = !branch.canCreatePaymentOrder;
    request.canCreatePaymentOrder = canCreatePaymentOrderStatus;
    this.merhcantClient
      .updateMerchantSetting(branch.branchId, branch.merchantId, request)
      .subscribe({
        next: (response: Merchant) => {
          this.notificationService.showSuccessNotification(
            branch.canCreatePaymentOrder
              ? `${response.merchantName} cannot pay now.`
              : `${response.merchantName} now can pay.`
          );
          this.getAllCustomers();
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

  onInputSearch(value: any) {
    this.page = 1;
    if (!value) {
      this.searchCriteria = undefined;
    } else {
      this.searchCriteria = value;
    }
    this.getAllCustomers();
  }
}
