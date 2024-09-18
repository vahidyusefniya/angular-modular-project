// noinspection JSIgnoredPromiseFromCall

import { Component, OnInit } from "@angular/core";
import { CoreService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { CreateMerchantRequest, MerchantsClient } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import {ResponseErrorDto} from "@core/dto/core.dto";

@Component({
  selector: "app-merchants",
  templateUrl: "./merchants.component.html",
  styleUrls: ["./merchants.component.scss"],
})
export class MerchantsComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  merchants = [];
  openNewMerchantModal = false;
  createMerchantSub$ = new Subscription();
  branchId: number;
  cols: ICol[] = [
    {
      field: "currencyName",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      width: "auto",
      hidden: false,
    },
  ];

  constructor(
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private merchantsClient: MerchantsClient,
    private coreService: CoreService,
  ) {
    this.layoutService.setTabName(
      `${dictionary.System} / ${dictionary.Merchants}`
    );
    this.layoutService.checkPagePermission("MerchantRead");
    this.branchId = coreService.getBranchId()!;
  }

  ngOnInit() {}
  onNewMerchantClick(): void {
    this.openNewMerchantModal = true;
  }
  submitNewMerchant(data: CreateMerchantRequest): void {
    this.loading = true;
    this.createMerchantSub$ = this.merchantsClient.create(this.branchId, data).subscribe({
      next: () => {
        this.notificationService.showSuccessNotification(
          this.dictionary.CreatedMerchantSuccessFully
        );
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
      complete: () => {
        this.loading = false;
        // this.initCurrencies();
      },
    });
  }
  onRefreshClick(): void {}

  ngOnDestroy(): void {}
}
