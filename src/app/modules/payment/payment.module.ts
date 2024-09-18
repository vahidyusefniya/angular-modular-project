import { NgModule } from "@angular/core";

import { SharedModule } from "@app/shared/shared.module";
import { PaymentComponent } from "./view/payment/payment.component";
import { PaymentInformationComponent } from "./components/payment-information/payment-information.component";
import { BankTransferComponent } from "./components/bank-transfer/bank-transfer.component";
import { PaymentRoutingModule } from "./payment-routing.module";
import { RedeemComponent } from "./components/redeem/redeem.component";
import { ChequeComponent } from "./components/cheque/cheque.component";
import { NgOptimizedImage } from "@angular/common";
import { CoreModule } from "@app/core/core.module";
import {
  CurrenciesClient,
  GatewayListsClient,
  PaymentOrdersClient,
  PaymentProviderClient,
} from "@app/proxy/proxy";
import { AchModalComponent } from "./components/ach-modal/ach-modal.component";

@NgModule({
  declarations: [
    PaymentComponent,
    PaymentInformationComponent,
    BankTransferComponent,
    RedeemComponent,
    ChequeComponent,
    AchModalComponent,
  ],
  imports: [SharedModule, CoreModule, PaymentRoutingModule, NgOptimizedImage],
  providers: [
    PaymentOrdersClient,
    CurrenciesClient,
    GatewayListsClient,
    PaymentProviderClient,
  ],
})
export class PaymentModule {}
