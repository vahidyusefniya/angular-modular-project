// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { CurrenciesClient, Currency } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";

@Component({
  selector: "app-currencies",
  templateUrl: "./currencies.component.html",
  styleUrls: ["./currencies.component.scss"],
})
export class CurrenciesComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  getCurrencies$ = new Subscription();
  showCurrencyForm: boolean = false;
  showEditCurrencyForm: boolean = false;
  currencyForm = new Currency();
  page = 1;
  pageSize = 12;
  cols: ICol[] = [
    {
      field: "currencyName",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "CurrencyWrite",
      width: "auto",
      hidden: false,
    },
  ];
  currencies: Currency[] = [];

  constructor(
    private currenciesClient: CurrenciesClient,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private coreService: CoreService,
    private loadingService: LoadingService
  ) {
    this.layoutService.setTabName(
      `${dictionary.Currencies} - ${dictionary.System}`
    );
    this.layoutService.checkPagePermission("CurrencyRead");
  }

  ngOnInit() {
    this.initCurrencies();
  }

  onEditCurrencyClick(model: any): void {
    this.currencyForm = { ...model.data };
    this.showEditCurrencyForm = true;
  }

  showNewCurrencyForm() {
    this.currencyForm = new Currency();
    this.showCurrencyForm = true;
  }

  submitCreate(model: string): void {
    this.loading = true;
    this.currencies = [];
    this.showCurrencyForm = false;
    this.getCurrencies$ = this.currenciesClient.create(model).subscribe({
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
        this.initCurrencies();
      },
    });
  }

  submitUpdate(model: Currency) {
    this.loading = true;
    this.currencies = [];
    this.showEditCurrencyForm = false;
    this.getCurrencies$ = this.currenciesClient
      .update(model.currencyId, model.currencyName)
      .subscribe({
        next: () => {
          this.notificationService.showSuccessNotification(
            this.dictionary.UpdatedCurrencySuccessFully
          );
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.initCurrencies();
        },
      });
  }

  initCurrencies(): void {
    this.loading = true;
    this.currencyForm = new Currency();
    this.getCurrencies$ = this.currenciesClient.getCurrencies().subscribe({
      next: (res) => {
        this.currencies = res;
        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  onExcelExportClick(): void {
    // this.loading = true;
    this.loadingService.present()
    this.getCurrencies$ = this.currenciesClient
    .getCurrencies()
    .subscribe({
      next: (res) => {
        let currencies = res.map((item) => ({
          currencyId: item.currencyId,
          currencyName: item.currencyName,
        }));
        this.coreService.exportExcel(currencies, dictionary.Currencies);
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

  onRefreshClick(): void {
    this.initCurrencies();
  }

  ngOnDestroy(): void {
    this.getCurrencies$.unsubscribe();
  }
}
