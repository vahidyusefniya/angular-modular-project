import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { CustomerPostpaidComponent } from "./view/customer-postpaid/customer-postpaid.component";


const routes: Routes = [
  {
    path: "",
    component: CustomerPostpaidComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerPostpaidRoutingModule {}
