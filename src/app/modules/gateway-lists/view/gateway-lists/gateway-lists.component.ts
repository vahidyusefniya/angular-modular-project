import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  GatewayList,
  GatewayListsClient,
  MerchantSummary,
  SystemClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { IGatewayLists } from "../../dto/gatewayLists.dto";

@Component({
  selector: "app-gateway-lists",
  templateUrl: "./gateway-lists.component.html",
  styleUrls: ["./gateway-lists.component.scss"],
})
export class GatewayListsComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  cols: any[] = [
    {
      field: "name",
      header: dictionary.Name,
    },
    {
      field: "delete",
      header: dictionary.Empty,
    },
  ];
  gatewayLists: IGatewayLists[] = [];
  page = 1;
  pageSize = 10;
  initPage$ = new Subscription();
  deleteGatewayList$ = new Subscription();
  branchId: number | undefined;
  permissions: string[] = [];
  customers: MerchantSummary[] = [];
  openShowCustomerModal = false;
  gateWayListName: string | undefined;
  gatewayList: IGatewayLists | undefined
  errorObject: ResponseErrorDto | undefined
  constructor(
    private coreService: CoreService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private router: Router,
    private titleService: Title,
    private systemClient: SystemClient,
    private gatewayListsClient: GatewayListsClient,
    private alertController: AlertController
  ) {
    this.branchId = this.coreService.getBranchId();
    this.layoutService.checkPagePermission("RoleRead");
  }

  ngOnInit() {
    this.permissions = this.layoutService.permissions;
    this.layoutService.checkPagePermission("GatewayListRead");
    this.initPage();
    this.initBreadcrumbs();
    this.initTitle();
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/gateway-lists`,
        deActive: false,
        label: dictionary.GatewayLists,
      },
    ]);
    this.layoutService.setBreadcrumbVariable(``);
  }

  initTitle() {
    this.titleService.setTitle(`Ezpin`);
  }

  onRefreshClick(): void {
    this.initPage();
  }

  initPage(): void {
    this.loadingService.present();
    this.initPage$ = this.gatewayListsClient
      .getGatewayLists(this.branchId!)
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.gatewayLists = res.map((item: GatewayList): IGatewayLists => {
            return {
              gatewayListId: item.gatewayListId,
              name: item.name,
              merchantName: item.branch.merchant?.merchantName!,
              rootBranchId: item.branch.merchant?.rootBranchId!,
              merchantId: item.branch.merchant?.merchantId!,
            };
          });
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  async deleteGatewayListConfirmationAlert(item: IGatewayLists) {
    this.gateWayListName = item.name;
    
    const alert = await this.alertController.create({
      header: dictionary.DeleteGatewayList,
      message: dictionary.DeleteGatewayListConfirmationAlert,
      animated: false,
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Delete,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.deleteGatewayList(false, item);
          },
        },
      ],
    });
    await alert.present();
  }

  deleteGatewayList(isForse: boolean, gateway: IGatewayLists) {
    this.loadingService.present();
    this.gatewayListsClient
      .delete(this.branchId!, gateway.gatewayListId, isForse)
      .subscribe({
        next: () => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            dictionary.GateWayListDeleted
          );
          this.initPage();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          if(error.typeName === 'GatewayListAlreadyAssignedToMerchantException'){
            this.gatewayList = gateway
            this.errorObject = error
            this.handleIsForceDeleteGatewayList(error, gateway);
          }else{
            throw Error(JSON.stringify(error));
          }
        },
      });
  }

  async handleIsForceDeleteGatewayList(
    error: ResponseErrorDto,
    gateway: IGatewayLists
  ) {
    const alert = await this.alertController.create({
      header: dictionary.DeleteGatewayListLastConfirmationAlert!,
      message: error.message,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.ShowCustomers,
          cssClass: "primary-alert-btn",
          handler: () => {
            this.onShowCustomerClick(gateway);
          },
        },
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Delete,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.deleteGatewayList(true, gateway);
          },
        },
      ],
    });
    await alert.present().then(() => {
      const alertButtons = document.querySelector(
        ".alert-button-group-vertical"
      );
      if (alertButtons) {
        alertButtons.classList.remove("alert-button-group-vertical");
      }
    });
  }

  onShowCustomerClick(gateway: IGatewayLists): void {
    this.loadingService.present();
    this.gatewayListsClient
      .getAssignedMerchantsByGatewayListId(
        this.branchId!,
        gateway.gatewayListId
      )
      .subscribe({
        next: (res) => {
          this.customers = res;
          this.openShowCustomerModal = true;
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  dismissCustomersModal() {
    this.openShowCustomerModal = false
    this.handleIsForceDeleteGatewayList(this.errorObject!, this.gatewayList!)
  }

  redirectToAddGatewayList() {
    this.router.navigate([`/branches/${this.branchId}/gateway-lists/add`]);
  }

  onEditGatewayListClick(item: IGatewayLists) {
    this.router.navigate([
      `/branches/${this.branchId}/gateway-lists/${item.gatewayListId}`,
    ]);
  }

  onExcelExportClick(): void {
    const gateway_lists = this.gatewayLists.map((item) => {
      return {
        name: item.name,
        gatewayListId: item.gatewayListId,
      };
    });
    this.coreService.exportExcel(gateway_lists, "gateway_lists");
  }

  ngOnDestroy(): void {
    this.deleteGatewayList$.unsubscribe();
    this.initPage$.unsubscribe();
  }
}
