import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import { SharedModule } from "@app/shared/shared.module";
import { ReportsRoutingModule } from "./reports.routing.module";

import {
  CurrenciesClient,
  ReportsClient,
  WalletsClient,
} from "@app/proxy/proxy";

import { ScrollingModule } from "@angular/cdk/scrolling";

import { BuyOrdersClient } from "@app/proxy/shop-proxy";
import { AggregateReportFilterComponent } from "./aggregate-report/component/aggregate-report-filter/aggregate-report-filter.component";
import { AggregateReportComponent } from "./aggregate-report/view/aggregate-report/aggregate-report.component";
import { BuysFilterComponent } from "./buys/component/buys-filter/buys-filter.component";
import { BuysStateLogsComponent } from "./buys/component/buys-state-logs/buys-state-logs.component";
import { SendEmailComponent } from "./buys/component/send-email/send-email.component";
import { BuysComponent } from "./buys/view/buys/buys.component";
import { SalesFilterComponent } from "./sales/component/sales-filter/sales-filter.component";
import { SalesStateLogsComponent } from "./sales/component/sales-state-logs/sales-state-logs.component";
import { SalesComponent } from "./sales/view/sales/sales.component";

@NgModule({
  declarations: [
    BuysComponent,
    BuysFilterComponent,
    BuysStateLogsComponent,
    SalesComponent,
    SalesFilterComponent,
    SalesStateLogsComponent,
    SendEmailComponent,
    AggregateReportComponent,
    AggregateReportFilterComponent,
  ],
  imports: [ReportsRoutingModule, SharedModule, CoreModule, ScrollingModule],
  providers: [
    BuyOrdersClient,
    CurrenciesClient,
    WalletsClient,
    CurrenciesClient,
    ReportsClient,
  ],
  exports: [
    BuysComponent,
    BuysFilterComponent,
    BuysStateLogsComponent,
    SalesComponent,
    SalesFilterComponent,
    SalesStateLogsComponent,
    SendEmailComponent,
  ],
})
export class ReportsModule {}
