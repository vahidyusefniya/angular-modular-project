import { Component, OnInit } from "@angular/core";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CreateMerchantCurrencyLimitRequest,
  MerchantCurrencyLimit,
  MerchantCurrencyLimitsClient,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { AlertController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { CustomerService } from "../../service/customer.service";

interface ConvertedCurrencyLimit {
  amount: string;
  currencyName: string;
  currencyId: number;
  id: number;
  merchantId: number;
}
@Component({
  selector: "app-buy-limit",
  templateUrl: "./buy-limit.component.html",
  styleUrls: ["./buy-limit.component.scss"],
})
export class BuyLimitComponent implements OnInit {
  dictionary = dictionary;
  loading: boolean = false;
  buyLimitList: ConvertedCurrencyLimit[] = [];
  cols: ICol[] = [
    {
      field: "currencyName",
      header: dictionary.Currency,
      hasNormalRow: true,
      linkRowPermission: "ProductRead",
      width: "auto",
      hidden: false,
    },
    {
      field: "amount",
      header: dictionary.TotalByAmount,
      hasNormalRow: false,
      width: "auto",
      hidden: false,
      hasLinkRow: true,
      linkRowPermission: "AssignMerchantToSaleManager",
    },
    {
      field: "delete",
      header: dictionary.Empty,
      hasNormalRow: true,
      linkRowPermission: "AssignMerchantToSaleManager",
      hasIconRow: true,
      iconRow: [
        {
          type: "delete",
          fill: "clear",
          color: "danger",
          name: "icon",
          permission: "AssignMerchantToSaleManager",
          eventName: "deleteLimitConfirmation",
        },
      ],
      width: "auto",
      hidden: false,
    },
  ];
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  page = 1;
  pageSize = 10;
  openSetLimitModal: boolean = false;
  branchId: number | undefined;
  merchentId: number | undefined;
  limitaionData = new CreateMerchantCurrencyLimitRequest();
  selectedLimitId!: number;

  constructor(
    private loadingService: LoadingService,
    private layoutService: LayoutService,
    private customerService: CustomerService,
    private coreService: CoreService,
    private merchantCurrencyClient: MerchantCurrencyLimitsClient,
    private alertController: AlertController,
    private notificationService: NotificationService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchentId = this.customerService.branch?.merchantId;
  }

  ngOnInit() {
    this.initBreadcrumbs();
    this.getBuyLimitList();
  }

  getBuyLimitList(): void {
    this.loadingService.present();
    this.loading = true;
    this.merchantCurrencyClient
      .getMerchantCurrencyLimits(this.branchId!, this.merchentId!)
      .subscribe({
        next: (res: MerchantCurrencyLimit[]) => {
          this.buyLimitList = this.convertToNewObj(res);
          this.loading = false;
        },
        error: (err) => {
          this.loadingService.dismiss();
          throw Error(err.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  convertToNewObj(data: MerchantCurrencyLimit[]): ConvertedCurrencyLimit[] {
    return data.map((currencyLimit) => ({
      amount: currencyLimit.amount.toLocaleString(),
      currencyName: currencyLimit.currency.currencyName,
      currencyId: currencyLimit.currency.currencyId,
      id: currencyLimit.currencyLimitId,
      merchantId: currencyLimit.merchantId,
    }));
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

  onRefreshClick() {
    this.getBuyLimitList();
  }

  onExcelExportClick() {
    this.coreService.exportExcel(this.buyLimitList, "buyLimit");
  }

  dismissSetLimitationModal(): void {
    this.openSetLimitModal = false;
  }

  addNewSetLimitBtn() {
    this.limitaionData.init({ amount: undefined, currencyId: undefined });
    this.openSetLimitModal = true;
  }

  setLimitation() {
    this.loadingService.present();
  }

  onRemoveCustomer(currencyLimit: ConvertedCurrencyLimit) {
    this.loadingService.present();
    this.merchantCurrencyClient
      .delete(this.branchId!, this.merchentId!, currencyLimit.id)
      .subscribe({
        next: (res) => {
          this.getBuyLimitList();
          this.notificationService.showSuccessNotification(
            `${currencyLimit.currencyName} was deleted.`
          );
        },
        error: (err) => {
          this.loadingService.dismiss();
          throw Error(err.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  limitAction(data: any) {
    this.limitaionData.init({
      amount: data.data.amount,
      currencyId: data.data.currencyId,
    });
    if (data.state === "edit") {
      this.onSubmitEditLimit(this.limitaionData);
    } else if (data.state === "new") {
      this.onAddNewLimit(this.limitaionData);
    }
  }

  onAddNewLimit(data: CreateMerchantCurrencyLimitRequest) {
    this.loadingService.present();
    this.merchantCurrencyClient
      .put(this.branchId!, this.merchentId!, data)
      .subscribe({
        next: (res) => {
          this.getBuyLimitList();
          this.notificationService.showSuccessNotification(
            `Set buy limit successfully.`
          );
        },
        error: (err) => {
          this.loadingService.dismiss();
          throw Error(err.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  onSubmitEditLimit(data: CreateMerchantCurrencyLimitRequest) {
    this.loadingService.present();
    this.merchantCurrencyClient
      .update(
        this.branchId!,
        this.merchentId!,
        this.selectedLimitId,
        data.amount
      )
      .subscribe({
        next: (res) => {
          this.getBuyLimitList();
          this.notificationService.showSuccessNotification(
            `buy limit was edited.`
          );
        },
        error: (err) => {
          this.loadingService.dismiss();
          throw Error(err.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  onEditLimitConfirmation(data: any) {
    this.selectedLimitId = data.data.id;
    this.limitaionData.init({
      amount: data.data.amount,
      currencyId: data.data.currencyId,
    });
    this.openSetLimitModal = true;
  }

  async deleteLimitConfirmation(data: any) {
    const alert = await this.alertController.create({
      header: dictionary.Delete,
      message: `Are you sure you want to delete the buy limit with the following specifications?<br><br>
        Currency: <b>${data.data.currencyName}</b><br>
        Total buy amount: <b>${data.data.amount}</b>`,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Delete,
          role: "delete",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.onRemoveCustomer(data.data);
          },
        },
      ],
    });

    await alert.present();
  }
}
