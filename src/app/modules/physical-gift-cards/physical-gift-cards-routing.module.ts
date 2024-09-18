import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { ActivateCardsComponent } from "./view/activate-cards/activate-cards.component";
import { CheckCardComponent } from "./view/check-card/check-card.component";
import { PhysicalShopComponent } from "./view/physical-shop/physical-shop.component";
import { OrdersComponent } from "./view/orders/orders.component";
import { CustomerOrdersComponent } from "./view/customer-orders/customer-orders.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "activate-cards",
    pathMatch: "full",
  },
  {
    path: "activate-cards",
    component: ActivateCardsComponent,
    data: {
      breadcrumb: dictionary.ActivateCards,
    },
  },
  {
    path: "check-card",
    component: CheckCardComponent,
    data: {
      breadcrumb: dictionary.CheckCard,
    },
  },
  {
    path: "physical-shop",
    component: PhysicalShopComponent,
    data: {
      breadcrumb: dictionary.PhysicalShop,
    },
  },
  {
    path: "orders",
    component: OrdersComponent,
    data: {
      breadcrumb: dictionary.Orders,
    },
  },
  {
    path: "customer-orders",
    component: CustomerOrdersComponent,
    data: {
      breadcrumb: dictionary.CustomerOrders,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhysicalGiftCardsRoutingModule {}
