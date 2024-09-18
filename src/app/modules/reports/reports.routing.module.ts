import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { BuysComponent } from "./buys/view/buys/buys.component";
import { SalesComponent } from "./sales/view/sales/sales.component";
import { AggregateReportComponent } from "./aggregate-report/view/aggregate-report/aggregate-report.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "orders",
    pathMatch: "full",
  },
  {
    path: "buys",
    component: BuysComponent,
    data: {
      breadcrumb: dictionary.Buys,
    },
  },
  {
    path: "sales",
    component: SalesComponent,
    data: {
      breadcrumb: dictionary.Sales,
    },
  },
  {
    path: "aggregate-sales-report",
    component: AggregateReportComponent,
    data: {
      breadcrumb: dictionary.AggregateSalesReport,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
