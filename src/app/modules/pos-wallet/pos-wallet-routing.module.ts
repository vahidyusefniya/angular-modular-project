import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PosWalletComponent } from './view/pos-wallet/pos-wallet.component';
import { TransactionWalletComponent } from './view/transaction-wallet/transaction-wallet.component';

const routes: Routes = [
  {
    path: "",
    component: PosWalletComponent,
  },
  {
    path: ":currencyId",
    component: TransactionWalletComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosWalletRoutingModule { }
