// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Bank, BanksClient } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";

@Component({
  selector: "app-banks",
  templateUrl: "./banks.component.html",
  styleUrls: ["./banks.component.scss"],
})
export class BanksComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  getBanks$ = new Subscription();
  showBankForm: boolean = false;
  showEditBankForm: boolean = false;
  bankForm = new Bank();
  cols: ICol[] = [
    {
      field: "bankName",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "BankWrite",
      width: "auto",
      hidden: false,
    },
  ];
  page: number = 1;
  pageSize: number = 10;
  banks: Bank[] = [];

  constructor(
    private banksClient: BanksClient,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private coreService: CoreService,
    private loadingService: LoadingService
  ) {
    this.layoutService.setTabName(`${dictionary.Banks} - ${dictionary.System}`);
    this.layoutService.checkPagePermission("BankWrite");
  }

  ngOnInit() {
    this.initBanks(1);
  }

  onEditCurrencyClick(model: any): void {
    this.bankForm = { ...model.data };
    this.showEditBankForm = true;
  }

  onExcelExportClick(): void {
    if (this.banks.length == 0) return;
    this.loadingService.present();
    this.getBanks$ = this.banksClient.getBanks(-1).subscribe({
      next: (res) => {
        let banks = res.map((item) => ({
          bankId: item.bankId,
          bankName: item.bankName,
        }));
        this.coreService.exportExcel(banks, dictionary.Banks);
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

  showNewBankForm() {
    this.bankForm = new Bank();
    this.showBankForm = true;
  }

  submitCreate(model: string): void {
    this.loading = true;
    this.banks = [];
    this.showBankForm = false;
    this.getBanks$ = this.banksClient.create(model).subscribe({
      next: () => {
        this.notificationService.showSuccessNotification(
          this.dictionary.CreatedCurrencySuccessFully
        );
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
      complete: () => {
        this.initBanks(1);
      },
    });
  }

  submitUpdate(model: Bank) {
    this.loading = true;
    this.banks = [];
    this.showEditBankForm = false;
    this.getBanks$ = this.banksClient
      .update(model.bankId, model.bankName)
      .subscribe({
        next: () => {
          this.notificationService.showSuccessNotification(
            this.dictionary.UpdatedBankSuccessFully
          );
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.initBanks(1);
        },
      });
  }

  initBanks(page: number): void {
    this.page = page;
    this.loading = true;
    this.bankForm = new Bank();
    this.getBanks$ = this.banksClient
      .getBanks(this.page, this.pageSize)
      .subscribe({
        next: (res) => {
          this.banks = res;
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  onRefreshClick(): void {
    this.initBanks(1);
  }

  ngOnDestroy(): void {
    this.getBanks$.unsubscribe();
  }
}
