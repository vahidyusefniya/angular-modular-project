import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { CustomerService } from "@app/modules/customer/service/customer.service";
import { Branch, BranchesClient, SaleManagersClient } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, ModalController } from "@ionic/angular";
import { SalesManagerService } from "../../service/sales-manager.service";
interface CustomerObj {
  MerchantName: string;
  SaleManagerName: string;
}
@Component({
  selector: "app-assigned-customers-tab",
  templateUrl: "./assigned-customers-tab.component.html",
  styleUrls: ["./assigned-customers-tab.component.scss"],
})
export class AssignedCustomersTabComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  showAssignCustomersModal: boolean = false;
  branchId: number;
  customers: Branch[] = [];
  allCustomers: Branch[] = [];
  selectedCustomer: Branch | undefined;
  searchCustomer: string = "";
  cols: ICol[] = [
    {
      field: "merchantName",
      header: dictionary.Name,
      hasNormalRow: true,
      linkRowPermission: "SaleManagerRead",
      width: "auto",
      hidden: false,
    },
    {
      field: "delete",
      header: dictionary.Empty,
      hasNormalRow: true,
      linkRowPermission: "AssignMerchantToSaleManager",
      hasIconRow: true,
      iconRow: [{ type: 'delete', fill: 'clear', color: 'danger', name: 'icon', permission: 'AssignMerchantToSaleManager', eventName: 'unassignToBranchConfirmation' }],
      width: "auto",
      hidden: false,
    }
  ];
  loading: boolean = false;
  page = 1;
  pageSize = 10;


  constructor(
    private branchClient: BranchesClient,
    private coreService: CoreService,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private router: Router,
    private layoutService: LayoutService,
    private salesService: SalesManagerService,
    private saleManagerService: SaleManagersClient,
    private alertController: AlertController,
  ) {
    this.branchId = coreService.getBranchId()!;

  }

  ngOnInit() {
    this.getCustomers()
  }


  getCustomers() {
    this.loading = true;
    this.branchClient.getSubMerchants(this.branchId, this.salesService.getSaleManager?.saleManagerId!, true, false).subscribe({
      next: (res) => {
        this.customers = res;
        this.allCustomers = res;
        this.initBreadcrumbs();
      },
      error: (err) => {
        this.loading = false;
        throw Error(err.message);
      },
      complete: () => {
        this.loading = false;
      }
    })
  }


  onRemoveCustomer(event: any) {
    this.loadingService.present();
    this.saleManagerService.unAssignMerchant(this.branchId, this.salesService.getSaleManager?.saleManagerId!, event.data.merchantId).subscribe({
      next: (res) => {
        this.getCustomers();
        this.notificationService.showSuccessNotification(
          `${event.data.merchantName} unassigned.`
        );
      },
      error: (err) => {
        this.loadingService.dismiss();
        throw Error(err.message);
      },
      complete: () => {
        this.loadingService.dismiss();
      }
    })
  }


  showCustomerModal() {
    this.showAssignCustomersModal = true;
  }

  dismissAssignBranchModal(): void {
    this.selectedCustomer = undefined;
    this.showAssignCustomersModal = false;
  }

  setSelectedBranch(branchIds: number[], forceAssign: boolean = false) {
    this.loadingService.present();
    this.saleManagerService.assignMerchants(this.branchId, this.salesService.getSaleManager?.saleManagerId!, branchIds, forceAssign).subscribe({
      next: (res) => {
        this.getCustomers();
      },
      error: (err: ResponseErrorDto) => {
        this.loadingService.dismiss();
        if (err.typeName === dictionary.MerchantAlreadyAssignedToSaleManagerException) {
          const errorData = JSON.parse(err.message!);
          this.assignExceptionAlert(branchIds, errorData)
        }
      },
      complete: () => {
        this.loadingService.dismiss();
      }
    })
  }

  async unassignToBranchConfirmation(data: any) {
    const alert = await this.alertController.create({
      header: dictionary.UnAssignCustomer,
      message: `Are you sure to unassign <b>${data.data.merchantName
        }</b> from <b>${this.salesService.getSaleManager?.name
        }</b>?`,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.UnAssign,
          role: "delete",
          cssClass: "primary-alert-btn",
          handler: () => {
            this.onRemoveCustomer(data)
          },
        },
      ],
    });

    await alert.present();
  }

  async assignExceptionAlert(branchIds: number[], data: any) {
    let message = `The following customers have a specified sales manager. Do you want to change to <b>${this.salesService.getSaleManager?.name}</b>?<br/><br/>`;
    data.forEach((customer: CustomerObj) => {
      message += `<b>${customer.MerchantName}</b>: sale manager <b>${customer.SaleManagerName}</b><br/>`;
    });
    const alert = await this.alertController.create({
      header: dictionary.AssignCustomer,
      message: message,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Confirm,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            this.setSelectedBranch(branchIds, true)
          },
        },
      ],
    });

    await alert.present();
  }


  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      `${this.salesService.getSaleManager?.name}`
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/sale-managers`,
        deActive: false,
        label: dictionary.SaleManagers,
      },
      {
        url: `/branches/${this.branchId}/sale-managers/${this.salesService.getSaleManager?.saleManagerId}`,
        deActive: false,
        label: dictionary.Detail,
      },
    ]);
  }

  localSearchCustomer(page: number, query: any) {
    this.page = page;
    if (query.trim().length > 0) {
      this.searchCustomer = query;
      this.customers = [...this.allCustomers]
        .filter((x) =>
          x.merchantName
            .toLocaleLowerCase()
            .includes(this.searchCustomer.toLocaleLowerCase())
        )
        .slice((page - 1) * this.pageSize, page * this.pageSize);
    } else {
      this.searchCustomer = "";
      this.customers = [...this.allCustomers].slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
    }
  }

  assignToSale(branchName: string) {
    this.modalCtrl.dismiss();
    this.loadingService.present();
    this.branchClient
      .assignMerchant(
        this.selectedCustomer!.branchId,
        this.customerService.branch?.merchantId!
      )
      .subscribe(() => {
        this.notificationService.showSuccessNotification(
          `${this.customerService.branch?.merchantName} assigned to ${branchName}.`
        );
        this.loadingService.dismiss();
        this.router.navigate([`/branches/${this.branchId}/sale-managers`]);
      });
  }


  onExcelExportClick() {
    this.coreService.exportExcel(this.customers, `${this.salesService.getSaleManager?.name} assignedCustomerList`);
  }

  onRefreshClick() {
    this.getCustomers();
  }

  ngOnDestroy() {
    this.layoutService.setBreadcrumbs([]);
  }


}
