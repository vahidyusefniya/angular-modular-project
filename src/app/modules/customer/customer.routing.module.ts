import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { AssignToBranchTabComponent } from "@modules/customer/component/assign-to-branch-tab/assign-to-branch-tab.component";
import { PriceListTabComponent } from "@modules/customer/component/price-list-tab/price-list-tab.component";
import { FinancialActivitiesComponent } from "./component/financial-activities-tab/financial-activities-tab.component";
import { CustomerDetailComponent } from "./view/customer-detail/customer-detail.component";
import { CustomerListComponent } from "./view/customer-list/customer-list.component";
import { WalletComponent } from "./view/wallet/wallet.component";
import { SalesReportsTabComponent } from "./component/sales-reports-tab/sales-reports-tab.component";
import { BuyLimitComponent } from "./component/buy-limit/buy-limit.component";
import { GatewayListComponent } from "./component/gateway-list/gateway-list.component";
import { CreateCustomerComponent } from "./view/create-customer/create-customer.component";
import { PostpaidTabComponent } from "./component/postpaid-tab/postpaid-tab.component";
import { CustomerOrdersComponent } from "./component/customer-orders/customer-orders.component";

const routes: Routes = [
  {
    path: "",
    component: CustomerListComponent,
  },
  {
    path: "create",
    component: CreateCustomerComponent,
    data: {
      breadcrumb: dictionary.NewCustomer,
    },
  },
  {
    path: ":customerId",
    component: CustomerDetailComponent,
    data: {
      breadcrumb: dictionary.CustomerDetail,
    },
    children: [
      {
        path: "price-list",
        component: PriceListTabComponent,
        data: {
          breadcrumb: dictionary.PriceList,
        },
      },
      {
        path: "wallet",
        component: WalletComponent,
        data: {
          breadcrumb: dictionary.Wallet,
        },
      },
      {
        path: "sales-reports",
        component: SalesReportsTabComponent,
        data: {
          breadcrumb: dictionary.Reports,
        },
      },
      {
        path: "info",
        component: AssignToBranchTabComponent,
        data: {
          breadcrumb: dictionary.AssignToBranch,
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
        path: "buy-limits",
        component: BuyLimitComponent,
        data: {
          breadcrumb: dictionary.BuyLimits,
        },
      },
      {
        path: "postpaid",
        component: PostpaidTabComponent,
        data: {
          breadcrumb: dictionary.Postpaid,
        },
      },
      {
        path: "gateway-list",
        component: GatewayListComponent,
        data: {
          breadcrumb: dictionary.GateWayList,
        },
      },
      {
        path: "physical-orders",
        component: CustomerOrdersComponent,
        data: {
          breadcrumb: dictionary.PhysicalOrders,
        },
      },
    ],
  },
  {
    path: ":customerId/wallet/:walletId",
    component: WalletComponent,
    data: {
      breadcrumb: dictionary.Wallet,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
