import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PriceListsComponent } from "./view/price-lists/price-lists.component";
import { PriceListPricesComponent } from "./view/price-list-prices/price-list-prices.component";
import { dictionary } from "@dictionary/dictionary";
import { MyPriceListComponent } from "./view/my-price-list/my-price-list.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "customer-price-lists",
    pathMatch: "full",
  },
  {
    path: "customer-price-lists",
    component: PriceListsComponent,
    data: {
      breadcrumb: dictionary.CustomerPriceList,
    },
  },
  {
    path: "customer-price-list/prices",
    component: PriceListPricesComponent,
    data: {
      breadcrumb: dictionary.Prices,
    },
  },
  {
    path: "my-price-list",
    component: MyPriceListComponent,
    data: {
      breadcrumb: dictionary.MyPriceList,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PriceListRoutingModule {}
