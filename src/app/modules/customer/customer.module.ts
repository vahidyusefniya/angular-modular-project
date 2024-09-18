import { NgModule } from "@angular/core";
import { ReportsModule } from "@app/modules/reports/reports.module";
import {
  BanksClient,
  CreditClient,
  CurrenciesClient,
  FinancialClient,
  GatewayListsClient,
  MerchantCurrencyLimitsClient,
  MerchantsClient,
  PostPayClient,
  PriceListsClient,
  SaleManagersClient,
  WalletsClient,
} from "@app/proxy/proxy";
import { AssignToBranchTabComponent } from "@modules/customer/component/assign-to-branch-tab/assign-to-branch-tab.component";
import { ChooseBranchComponent } from "@modules/customer/component/choose-branch/choose-branch.component";
import { WalletTransactionFilterComponent } from "@modules/customer/component/wallet-transaction-filter/wallet-transaction-filter.component";
import { WalletTransactionComponent } from "@modules/customer/component/wallet-transaction/wallet-transaction.component";
import { FinancialModule } from "../financial/financial.module";
import { PriceListModule } from "../price-list/price-list.module";
import { AssignGatewayListComponent } from "./component/assign-gateway-list/assign-gateway-list.component";
import { AssignPriceListCustomerComponent } from "./component/assign-price-list/assign-price-list.component";
import { AssignSaleManagerComponent } from "./component/assign-sale-manager/assign-sale-manager.component";
import { BuyLimitComponent } from "./component/buy-limit/buy-limit.component";
import { ChargeComponent } from "./component/charge/charge.component";
import { CreditTabComponent } from "./component/credit-tab/credit-tab.component";
import { CreditComponent } from "./component/credit/credit.component";
import { EditProfileComponent } from "./component/edit-profile/edit-profile.component";
import { FinancialActivitiesComponent } from "./component/financial-activities-tab/financial-activities-tab.component";
import { NewCustomerBranchComponent } from "./component/new-branch/new-branch.component";
import { PriceListTabComponent } from "./component/price-list-tab/price-list-tab.component";
import { RebateComponent } from "./component/rebate/rebate.component";
import { SalesReportsTabComponent } from "./component/sales-reports-tab/sales-reports-tab.component";
import { SetLimitComponent } from "./component/set-limit/set-limit.component";
import { SettleTransactionsFilterComponent } from "./component/settle-transactions-filter/settle-transactions-filter.component";
import { SettleTransactionsComponent } from "./component/settle-transactions/settle-transactions.component";
import { SettleComponent } from "./component/settle/settle.component";
import { WithdrawComponent } from "./component/withdraw/withdraw.component";
import { CustomerRoutingModule } from "./customer.routing.module";
import { CustomerDetailComponent } from "./view/customer-detail/customer-detail.component";
import { CustomerListComponent } from "./view/customer-list/customer-list.component";
import { WalletComponent } from "./view/wallet/wallet.component";

import { CustomerEditComponent } from "./component/customer-edit/customer-edit.component";
import { CustomerFilterComponent } from "./component/customer-filter/customer-filter.component";
import { GatewayListComponent } from "./component/gateway-list/gateway-list.component";
import { PostpaidFilterModalComponent } from "./component/postpaid-filter-modal/postpaid-filter-modal.component";
import { PostpaidTabComponent } from "./component/postpaid-tab/postpaid-tab.component";
import { CreateCustomerComponent } from "./view/create-customer/create-customer.component";
import { CustomerOrdersComponent } from "./component/customer-orders/customer-orders.component";
import { OrderDetailComponent } from "./component/order-detail/order-detail.component";
import { OrdersFilterComponent } from "./component/orders-filter/orders-filter.component";
import { ChangeStateModalComponent } from "./component/change-state-modal/change-state-modal.component";

@NgModule({
  declarations: [
    CustomerListComponent,
    NewCustomerBranchComponent,
    AssignPriceListCustomerComponent,
    WalletComponent,
    ChargeComponent,
    CreditComponent,
    SettleComponent,
    EditProfileComponent,
    AssignGatewayListComponent,
    WalletTransactionComponent,
    WalletTransactionFilterComponent,
    ChooseBranchComponent,
    CustomerDetailComponent,
    PriceListTabComponent,
    CreditTabComponent,
    SettleTransactionsComponent,
    SettleTransactionsFilterComponent,
    AssignToBranchTabComponent,
    WithdrawComponent,
    FinancialActivitiesComponent,
    RebateComponent,
    AssignSaleManagerComponent,
    SalesReportsTabComponent,
    BuyLimitComponent,
    SetLimitComponent,
    CreateCustomerComponent,
    CustomerEditComponent,
    GatewayListComponent,
    CustomerFilterComponent,
    PostpaidTabComponent,
    PostpaidFilterModalComponent,
    CustomerOrdersComponent,
    OrderDetailComponent,
    OrdersFilterComponent,
    ChangeStateModalComponent
  ],
  imports: [
    CustomerRoutingModule,
    PriceListModule,
    FinancialModule,
    ReportsModule,
  ],
  providers: [
    PriceListsClient,
    WalletsClient,
    CurrenciesClient,
    MerchantsClient,
    CreditClient,
    BanksClient,
    FinancialClient,
    SaleManagersClient,
    MerchantCurrencyLimitsClient,
    GatewayListsClient,
    PostPayClient,
  ],
})
export class CustomerModule {}
