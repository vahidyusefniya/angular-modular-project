// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
} from "@app/core/services";
import {
  InvoiceSummary,
  InvoicesClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ICol } from "@shared/components/page-list/page-list.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-invoices",
  templateUrl: "./invoices.component.html",
  styleUrls: ["./invoices.component.scss"],
})
export class InvoicesComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  cols: ICol[] = [
    {
      field: "invoiceId",
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
      field: "beginTime",
      header: dictionary.BeginTime,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "endTime",
      header: dictionary.EndTime,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      width: "auto",
      field: "action",
      header: dictionary.Empty,
      hidden: false,
    },
  ];

  invoices: InvoiceSummary[] = [];
  invoice: InvoiceSummary | undefined
  page = 1;
  pageSize = 10;
  merchantId = 0;
  openInvoiceDetailModal = false;
  getInvoices$ = new Subscription();
  getInvoice$ = new Subscription();
  branchId: number | undefined;

  constructor(
    private loadingService: LoadingService,
    private invoicesClient: InvoicesClient,
    private coreService: CoreService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;

  }

  ngOnInit() {
    this.initInvoices();
  }

  initInvoices(): void {
    this.loading = true;
    this.getInvoices$ = this.invoicesClient
      .getInvoices(
        this.merchantId!,
      )
      .subscribe({
        next: (res: InvoiceSummary[]) => {
          this.loading = false;
          this.invoices = res;
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
  }

  invoiceDetailClick(event: Event, data: InvoiceSummary): void {
    event.preventDefault();
    this.loadingService.present();
    this.getInvoice$ = this.invoicesClient.getInvoice(
      this.merchantId,
      data.invoiceId
    ).subscribe({
      next: (res) => {
        this.loadingService.dismiss();
        this.invoice = res;
        this.openInvoiceDetailModal = true;
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }

  onRefreshClick(): void {
    this.initInvoices();
  }

  onDownloadClick(data: any) {
  }

  async onExcelExportClick(): Promise<void> {
    // this.loading = true;
    this.loadingService.present()
    this.getInvoices$ = this.invoicesClient
      .getInvoices(
        this.merchantId,
      )
      .subscribe({
        next: (res: InvoiceSummary[]) => {
          this.coreService.exportExcel(res, dictionary.Invoices);
        },
        error: (error: ResponseErrorDto) => {
          // this.loading = false;
          this.loadingService.dismiss()
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss()
          // this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.getInvoices$.unsubscribe();
    this.getInvoice$.unsubscribe();
  }
}
