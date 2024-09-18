import { NgModule } from "@angular/core";

import { BranchesClient, CreditClient, CurrenciesClient, WalletsClient } from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { ChargeComponent } from "./components/charge/charge.component";
import { MyWalletRoutingModule } from "./my-wallet-routing.module";
import { WalletComponent } from "./view/wallet/wallet.component";
import { WalletTransactionComponent } from "./components/wallet-transaction/wallet-transaction.component";
import { WalletTransactionFilterComponent } from "./components/wallet-transaction-filter/wallet-transaction-filter.component";
import { CustomerSearchComponent } from "./components/customer-search/customer-search.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CoreModule } from "@app/core/core.module";
import { PrintComponent } from "@modules/my-wallet/view/print/print.component";
import { OrderDetailModalComponent } from "./components/order-detail-modal/order-detail-modal.component";

@NgModule({
  declarations: [
    WalletComponent,
    ChargeComponent,
    WalletTransactionComponent,
    WalletTransactionFilterComponent,
    CustomerSearchComponent,
    PrintComponent, 
    OrderDetailModalComponent
  ],
  imports: [SharedModule, CoreModule, MyWalletRoutingModule, ScrollingModule],
  providers: [WalletsClient, CreditClient, BranchesClient, WalletsClient, CurrenciesClient],
  exports: [WalletTransactionComponent],
})
export class MyWalletModule { }
