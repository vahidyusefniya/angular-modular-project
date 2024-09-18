import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PosWalletRoutingModule } from './pos-wallet-routing.module';
import { TransactionWalletComponent } from './view/transaction-wallet/transaction-wallet.component';
import { PosWalletComponent } from './view/pos-wallet/pos-wallet.component';
import { SharedModule } from '@app/shared/shared.module';
import { CoreModule } from '@app/core/core.module';
import { CreditClient, CurrenciesClient, WalletsClient } from '@app/proxy/proxy';


@NgModule({
  declarations: [TransactionWalletComponent, PosWalletComponent],
  imports: [
    CommonModule,
    PosWalletRoutingModule,
    SharedModule, 
    CoreModule
  ],
  providers: [WalletsClient, CreditClient, CurrenciesClient],
})
export class PosWalletModule { }
