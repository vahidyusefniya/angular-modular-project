import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { SaleManager, SaleManagersClient } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { SalesManagerService } from "../../service/sales-manager.service";
import { Subscription } from "rxjs";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-info",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"],
})
export class InfoComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  showEditModal: boolean = false;
  branchId: number;
  saleManager = new SaleManager();
  saleManagerInput = new SaleManager();
  editSaleManeger$ = new Subscription();
  getSaleManager$ = new Subscription();
  saleManagerId!: number;
  loading: boolean = false;

  constructor(
    private coreService: CoreService,
    private salesService: SalesManagerService,
    private layoutService: LayoutService,
    private saleManagerService: SaleManagersClient,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private titleService: Title
  ) {
    this.branchId = coreService.getBranchId()!;
    this.saleManagerId = this.salesService.getSaleManager?.saleManagerId!;
  }

  ngOnInit() {
    this.getSaleManager();
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

  initTitle() {
    this.titleService.setTitle(
      `${this.salesService.getSaleManager?.name} - ${dictionary.SaleManagers} - ${this.layoutService.branchName}`
    );
  }

  getSaleManager() {
    this.loading = true;
    this.loadingService.present();
    this.getSaleManager$ = this.saleManagerService
      .get(this.branchId, this.saleManagerId)
      .subscribe({
        next: (response: SaleManager) => {
          this.loadingService.dismiss();
          this.saleManager = response;
          this.salesService.setSaleManager = response;
          this.initBreadcrumbs();
          this.initTitle();
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  onEditSaleManager(data: any) {
    this.loading = true;
    this.loadingService.present();
    this.editSaleManeger$ = this.saleManagerService
      .update(this.branchId, this.saleManager.saleManagerId, data)
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `${res.name} edited successfully.`
          );
          this.getSaleManager();
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  changeActiveStatus(isActive: boolean) {
    return isActive ? dictionary.Active : dictionary.Deactive;
  }

  onOpenEditModal(): void {
    this.showEditModal = true;
    this.saleManagerInput = JSON.parse(JSON.stringify(this.saleManager));
  }

  ngOnDestroy(): void {
    this.editSaleManeger$.unsubscribe();
    this.getSaleManager$.unsubscribe();
  }
}
