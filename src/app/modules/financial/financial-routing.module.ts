import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InvoicesComponent } from "@modules/financial/view/invoices/invoices.component";
import { FinancialActivitiesComponent } from "./view/financial-activities/financial-activities.component";
import { dictionary } from "@dictionary/dictionary";
import { PeymentsComponent } from "./view/peyments/peyments.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "financial-activities",
    pathMatch: "full",
  },
  {
    path: "invoices",
    component: InvoicesComponent,
    data: {
      breadcrumb: dictionary.Invoices,
    },
  },
  {
    path: "financial-activities",
    component: FinancialActivitiesComponent,
    data: {
      breadcrumb: dictionary.FinancialActivities,
    },
  },
  {
    path: "peyments",
    component: PeymentsComponent,
    data: {
      breadcrumb: dictionary.Payments,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
