import { NgModule } from "@angular/core";

import {
  CurrenciesClient,
  ReportsClient,
  SaleManagersClient,
} from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { DateFilterComponent } from "@modules/dashboard/component/date-filter/date-filter.component";
import { HighchartsChartModule } from "highcharts-angular";
import { CustomerGridComponent } from "./component/customer-grid/customer-grid.component";
import { DashboardGridComponent } from "./component/dashboard-grid/dashboard-grid.component";
import { OfficesGridComponent } from "./component/offices-grid/offices-grid.component";
import { SaleManagerGridComponent } from "./component/sale-manager-grid/sale-manager-grid.component";
import { TopTenGridComponent } from "./component/top-ten-grid/top-ten-grid.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardService } from "./service/dashboard.service";
import { DashboardComponent } from "./view/dashboard.component";

@NgModule({
  declarations: [
    DashboardComponent,
    DateFilterComponent,
    DashboardGridComponent,
    CustomerGridComponent,
    SaleManagerGridComponent,
    OfficesGridComponent,
    TopTenGridComponent,
  ],
  imports: [SharedModule, DashboardRoutingModule, HighchartsChartModule],
  providers: [
    SaleManagersClient,
    ReportsClient,
    CurrenciesClient,
    DashboardService,
  ],
})
export class DashboardModule {}
