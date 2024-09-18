import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { LayoutService } from "@app/layout";
import {
  CurrenciesClient,
  Currency,
  CustomerAccountingReport,
  CustomerCreditAndWallet,
  Report,
  ReportsClient,
  Wallet,
} from "@app/proxy/proxy";
import { CoreService, LoadingService } from "@core/services";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { DateFilterComponent } from "@modules/dashboard/component/date-filter/date-filter.component";
import {
  CustomDateFilterDto,
  CustomerDto,
  CustomersDebtDto,
  DateRangeType,
  IFilterDateRangeDto,
  OfficeDto,
  ReportFilterDto,
  SaleManagerDto,
  TopTenItemDto,
} from "@modules/dashboard/dto/dashboard.dto";
import * as Highcharts from "highcharts";
import { Subject } from "rxjs";
import { DashboardService } from "../service/dashboard.service";

@Component({
  selector: "app-card",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent {
  dictionary = dictionary;
  highcharts = Highcharts;
  profitChartOptions: Highcharts.Options = {};
  saleChartOptions: Highcharts.Options = {};
  currencies: Currency[] = [];
  currency = new Currency();
  currencyId = 1;
  placeHolderTime: string | undefined;
  dateTime: DateRangeType = "CurrentMonth";
  dateTimeCmbData = [
    {
      name: dictionary.Today,
      value: "Today",
    },
    {
      name: dictionary.CurrentMonth,
      value: "CurrentMonth",
    },
    {
      name: dictionary.Custom,
      value: "Custom",
    },
  ];
  timeFilter = new CustomDateFilterDto();
  reportFilter = new ReportFilterDto();
  branchId: number;
  profit = 0;
  sale = 0;
  walletBalance = 0;
  creditBalance = 0;
  report = new Report();
  CustomersDebt: CustomersDebtDto | undefined;
  customers: CustomerDto[] = [];
  saleManagers: SaleManagerDto[] = [];
  offices: OfficeDto[] = [];
  topTenItems: TopTenItemDto[] = [];
  isDashboardServerError = false;
  profitChartData: Array<{ profits: number; date: string }> = [];
  saleChartData: Array<{ sale: number; date: string }> = [];

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private reportsClient: ReportsClient,
    private layoutService: LayoutService,
    private currenciesClient: CurrenciesClient,
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService
  ) {
    this.branchId = this.layoutService.branch!.branchId;

    this.activatedRoute.queryParams.subscribe((params) => {
      const { from: fromDate, end: endDate, currencyId } = params;
      if (fromDate && endDate && currencyId) {
        const begin_Date = new Date(fromDate);
        const end_Date = new Date(endDate);
        this.reportFilter.init({
          beginTime: begin_Date,
          endTime: end_Date,
          branchId: this.branchId,
        });
        this.dateTime = this.checkInitTime(
          this.reportFilter.beginTime,
          this.reportFilter.endTime
        );
        this.fillCurrencies(+currencyId);
      } else {
        const dateRange = this.dashboardService.getDateRange(this.dateTime);
        this.reportFilter.init({
          branchId: this.branchId,
          beginTime: dateRange.start,
          endTime: dateRange.end,
        });
        this.fillCurrencies();
      }
    });
  }

  checkInitTime(begin: any, end: any): string {
    return this.dashboardService.getTypeTime(begin, end);
  }

  fillCurrencies(currencyNumber?: number): void {
    this.loadingService.present();
    this.currenciesClient.getCurrencies().subscribe({
      next: (res: Currency[]) => {
        this.currencies = res;
        this.currency = currencyNumber
          ? res.find((r) => r.currencyId === currencyNumber)!
          : res.find((r) => r.currencyName === "USD")!;
        this.currencyId = this.currency.currencyId;
        this.fillReports(this.reportFilter, this.currencyId);
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }
  fillReports(filter: ReportFilterDto, currencyId: number): void {
    const me = this;
    this.reportsClient
      .report(filter.branchId, filter.beginTime!, filter.endTime!)
      .subscribe({
        next(res: Report) {
          me.loadingService.dismiss();
          me.report.init(res);
          me.initDashboard(me.filterReportByCurrency(res, currencyId));
        },
        error: (error: ResponseErrorDto) => {
          me.loadingService.dismiss();
          this.isDashboardServerError = true;
          throw Error(error.message);
        },
      });
  }
  filterReportByCurrency(report: Report, currencyId: number): Report {
    let uniqueReportsByCurrency = new Report();
    const credit = new Wallet();
    const creditCurrency = report.credit?.currencies?.filter(
      (c) => c.currency.currencyId == currencyId
    );
    credit.init({
      walletId: report.credit?.walletId,
      currencies: creditCurrency,
    });

    const wallet = new Wallet();
    const walletCurrency = report.wallet?.currencies?.filter(
      (c) => c.currency.currencyId == currencyId
    );
    wallet.init({
      walletId: report.credit?.walletId,
      currencies: walletCurrency,
    });

    const customersAccounting = report.customersAccounting.filter(
      (c) => c.currency.currencyId == currencyId
    );
    const officesAccounting = report.officesAccounting.filter(
      (o) => o.currency.currencyId == currencyId
    );
    const saleManagersAccounting = report.saleManagersAccounting.filter(
      (s) => s.currency.currencyId == currencyId
    );
    uniqueReportsByCurrency.init({
      wallet: wallet,
      credit: credit,
      customersCreditsAndWallets: report.customersCreditsAndWallets,
      customersAccounting: customersAccounting,
      officesAccounting: officesAccounting,
      saleManagersAccounting: saleManagersAccounting,
      topProducts: report.topProducts,
    });

    return uniqueReportsByCurrency;
  }
  initDashboard(report: Report) {
    this.calcProfitAndSale(report);
    this.calcMyWalletAndCredit(report);
    this.calcCustomersDebt(report.customersCreditsAndWallets);
    this.initDashboardLists(report);
    this.initDashboardCharts(report.customersAccounting);
  }
  calcProfitAndSale(report: Report): void {
    let profit = 0;
    let sale = 0;
    report.customersAccounting.forEach((item) => {
      profit += item.profit;
      sale += item.saleAmount;
    });
    this.profit = profit;
    this.sale = sale;
  }
  calcMyWalletAndCredit(report: Report): void {
    let walletBalance = 0;
    let creditBalance = 0;
    report.wallet.currencies?.forEach((currency) => {
      walletBalance += currency.balance;
    });
    if (report.credit) {
      report.credit.currencies?.forEach((currency) => {
        creditBalance += currency.balance;
      });
    }
    this.walletBalance = walletBalance;
    this.creditBalance = creditBalance;
  }
  calcCustomersDebt(item: CustomerCreditAndWallet | undefined | null): void {
    if (!item) return;
    let walletBalance = 0;
    let creditBalance = 0;

    if (item.wallet) {
      item.wallet.forEach((item) => {
        if (item.currency.currencyId == this.currencyId) {
          walletBalance += item.balance;
        }
      });
    }

    if (item.credit) {
      item.credit.forEach((item) => {
        if (item.currency.currencyId == this.currencyId) {
          creditBalance += item.balance;
        }
      });
    }

    this.CustomersDebt = {
      amount: walletBalance - creditBalance,
      name: dictionary.Empty,
    };
  }
  initDashboardLists(report: Report): void {
    this.customers = this.dashboardService.fillCustomers(
      report.customersAccounting
    );

    this.saleManagers = this.dashboardService.fillSaleManagers(
      report.saleManagersAccounting
    );

    this.offices = this.dashboardService.fillOffices(report.officesAccounting);

    this.topTenItems = report.topProducts.map((item) => ({
      name: item.product.productName,
      sales: Math.floor(item.saleCounts),
      profit: Math.floor(item.profit),
    }));
  }
  initDashboardCharts(data: CustomerAccountingReport[]): void {
    const groupCustomerAccountingByDate =
      this.dashboardService.groupCustomerAccountingReportByDate(data);

    this.profitChartData = this.dashboardService.fillProfitChartData(
      groupCustomerAccountingByDate
    );

    this.saleChartData = this.dashboardService.fillSaleChartData(
      groupCustomerAccountingByDate
    );

    this.profitChartOptions = {
      chart: {
        type: "line",
        backgroundColor: "transparent",
        scrollablePlotArea: {
          scrollPositionX: 0,
          minWidth: 600,
        },
        height: 330,
      },
      colors: ["#544fc5"],
      title: {
        text: dictionary.Profile,
        align: "left",
        style: { color: "transparent" },
      },
      xAxis: {
        categories: this.dashboardService.convertChartDates(
          this.profitChartData.map((item) => {
            return item.date.split("T")[0];
          })
        ),
        scrollbar: {
          enabled: true,
          barBackgroundColor: "red",
        },
        title: {
          text: " ",
        },
        labels: {
          style: {
            color: "var(--ion-text-color)",
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: "Amount",
        },
        stackLabels: {
          enabled: false,
        },
        labels: {
          style: {
            color: "var(--ion-text-color)",
          },
        },
      },

      legend: {
        enabled: false,
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "Total: {point.stackTotal}",
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true,
          },
          events: {},
          pointWidth: 30,
        },
      },
      series: [
        {
          type: "line",
          data: this.profitChartData.map((item) => {
            return item.profits;
          }),
        },
      ],
      credits: {
        enabled: false,
      },
      accessibility: {
        enabled: false,
      },
    };
    this.saleChartOptions = {
      chart: {
        type: "line",
        backgroundColor: "transparent",
        scrollablePlotArea: {
          scrollPositionX: 0,
          minWidth: 600,
        },
        height: 330,
      },
      colors: ["#544fc5"],
      title: {
        text: dictionary.Profile,
        align: "left",
        style: { color: "transparent" },
      },
      xAxis: {
        categories: this.dashboardService.convertChartDates(
          this.saleChartData.map((item) => {
            return item.date.split("T")[0];
          })
        ),
        scrollbar: {
          enabled: true,
          barBackgroundColor: "red",
        },
        title: {
          text: " ",
        },
        labels: {
          style: {
            color: "var(--ion-text-color)",
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: "Amount",
        },
        stackLabels: {
          enabled: false,
        },
        labels: {
          style: {
            color: "var(--ion-text-color)",
          },
        },
      },

      legend: {
        enabled: false,
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "Total: {point.stackTotal}",
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true,
          },
          events: {},
          pointWidth: 30,
        },
      },
      series: [
        {
          type: "line",
          data: this.saleChartData.map((item) => {
            return item.sale;
          }),
        },
      ],
      credits: {
        enabled: false,
      },
      accessibility: {
        enabled: false,
      },
    };
  }

  async dateTimeSelectionChange() {
    if (this.dateTime === "CurrentMonth") {
      this.timeFilter.init({ beginTime: undefined, endTime: undefined });
      this.reportFilter.init({
        branchId: this.branchId,
        endTime: this.dashboardService.getDateRange(this.dateTime).end,
        beginTime: this.dashboardService.getDateRange(this.dateTime).start,
      });
      this.loadingService.present();
      this.fillReports(this.reportFilter, this.currencyId);
    }
    if (this.dateTime === "Today") {
      this.timeFilter.init({ beginTime: undefined, endTime: undefined });
      this.reportFilter.init({
        branchId: this.branchId,
        endTime: this.dashboardService.getDateRange(this.dateTime).end,
        beginTime: this.dashboardService.getDateRange(this.dateTime).start,
      });
      this.fillReports(this.reportFilter, this.currencyId);
    }
    if (this.dateTime === "Custom") {
      const subject = new Subject<CustomDateFilterDto>();
      const data = this.timeFilter;
      const modal = await this.modalCtrl.create({
        component: DateFilterComponent,
        backdropDismiss: true,
        handle: false,
        animated: false,
        componentProps: {
          data,
          subject,
        },
        cssClass: "date__filter__modal",
      });
      subject.subscribe((data: CustomDateFilterDto) => {
        this.timeFilter.init(data);
        this.dateTime = "";
        this.reportFilter.init({
          branchId: this.branchId,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          beginTime: data.beginTime ? new Date(data.beginTime) : undefined,
        });
        this.fillReports(this.reportFilter, this.currencyId);
        modal.dismiss();
        subject.unsubscribe();
      });
      modal.onDidDismiss().then((_) => {
        this.dateTime = "";
      });

      await modal.present();
    }
  }

  changeCurrency(currency: Currency) {
    this.currency = currency;
    this.loadingService.present();
    setTimeout(() => {
      this.initDashboard(
        this.filterReportByCurrency(this.report, this.currency.currencyId)
      );
      this.loadingService.dismiss();
    }, 1000);
  }

  currencySelectionChange(id: number): void {
    this.currency = this.currencies.find((c) => c.currencyId == id)!;
    this.initDashboard(this.filterReportByCurrency(this.report, id));
  }

  getPlaceHolderTime(): string {
    if (this.timeFilter.beginTime || this.timeFilter.endTime) {
      return `${
        this.timeFilter.beginTime
          ? this.coreService.changeFormatDate(this.timeFilter.beginTime)
          : ""
      } ${
        this.timeFilter.endTime
          ? this.coreService.changeFormatDate(this.timeFilter.endTime)
          : ""
      }`;
    } else {
      return "";
    }
  }

  generateVisibleDate(data: IFilterDateRangeDto) {
    let fromDate = new Date(data.start!);
    let endDate = new Date(data.end!);
    return {
      from: `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${fromDate.getDate().toString().padStart(2, "0")}`,
      end: `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`,
    };
  }
}
