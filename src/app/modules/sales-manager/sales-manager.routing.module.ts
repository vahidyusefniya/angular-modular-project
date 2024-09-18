import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { AssignedCustomersTabComponent } from "./component/assigned-customers-tab/assigned-customers-tab.component";
import { InfoComponent } from "./component/info/info.component";
import { ReportCustomersComponent } from "./component/report-customers/report-customers.component";
import { DetailComponent } from "./view/detail/detail.component";
import { ListComponent } from "./view/list/list.component";

const routes: Routes = [
  {
    path: "",
    component: ListComponent,
  },
  {
    path: ":saleManagerId",
    component: DetailComponent,
    children: [
      {
        path: "assigned-customers",
        component: AssignedCustomersTabComponent,
        data: {
          breadcrumb: dictionary.AssignedCustomers,
        },
      },
      {
        path: "reports",
        component: ReportCustomersComponent,
        data: {
          breadcrumb: dictionary.Reports,
        },
      },
      {
        path: "info",
        component: InfoComponent,
        data: {
          breadcrumb: dictionary.Info,
        },
      },
    ],
    data: {
      breadcrumb: dictionary.Detail,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesManagerModuleRoutingModule { }
