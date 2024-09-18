import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DefinePosComponent } from "./view/define-pos/define-pos.component";
import { ShopComponent } from "./view/shop/shop.component";
import { OrdersComponent } from "./view/orders/orders.component";
import { AllOrdersComponent } from "./view/all-orders/all-orders.component";
import { dictionary } from "@dictionary/dictionary";

const routes: Routes = [
  {
    path: "",
    redirectTo: "shop",
    pathMatch: "full",
  },
  {
    path: "define-pos",
    component: DefinePosComponent,
    
  },
  {
    path: "shop",
    component: ShopComponent,
  },
  {
    path: "orders",
    component: OrdersComponent,
    data: {
      breadcrumb: dictionary.Orders,
    },
  },
  {
    path: "all-orders",
    component: AllOrdersComponent,
    data: {
      breadcrumb: dictionary.CustomerOrders,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PosRoutingModule {}
