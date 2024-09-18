import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WalletComponent } from "./view/wallet/wallet.component";
import {PrintComponent} from "@modules/my-wallet/view/print/print.component";

const routes: Routes = [
  {
    path: "",
    component: WalletComponent,
  },
  {
    path: "print",
    component: PrintComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyWalletRoutingModule {}
