import { NgModule } from "@angular/core";

import { SharedModule } from "@app/shared/shared.module";
import { InvoicesComponent } from "@modules/financial/view/invoices/invoices.component";
import { InvoicesRoutingModule } from "./financial-routing.module";
import { NgOptimizedImage } from "@angular/common";
import { CoreModule } from "@app/core/core.module";
import {
  CurrenciesClient,
  FinancialClient,
  InvoicesClient,
  PaymentOrdersClient,
  WalletsClient,
} from "@app/proxy/proxy";
import { FinancialActivitiesComponent } from "./view/financial-activities/financial-activities.component";
import { FinancialActivitiesFilterComponent } from "./component/financial-activities-filter/financial-activities-filter.component";
import { CustomerSearchComponent } from "./component/customer-search/customer-search.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { WalletOrderStatePipe } from "./pipe/wallet-order-state.pipe";
import { PeymentsComponent } from "./view/peyments/peyments.component";
import { BankTransferComponent } from "./component/bank-transfer/bank-transfer.component";
import { PaymentInformationComponent } from "./component/payment-information/payment-information.component";
import { RedeemComponent } from "./component/redeem/redeem.component";
import { ChequeComponent } from "./component/cheque/cheque.component";
import { PaymentOrderDetailModalComponent } from "./component/payment-order-detail-modal/payment-order-detail-modal.component";
import { PaymentFilterComponent } from "./component/payment-filter/payment-filter.component";
import { CreatePaymentComponent } from "./component/create-payment/create-payment.component";
import { FinancialActivitiesDetailComponent } from "./component/financial-activities-detail/financial-activities-detail.component";

@NgModule({
  declarations: [
    InvoicesComponent,
    FinancialActivitiesComponent,
    FinancialActivitiesFilterComponent,
    CustomerSearchComponent,
    WalletOrderStatePipe,
    PeymentsComponent,
    BankTransferComponent,
    PaymentInformationComponent,
    RedeemComponent,
    ChequeComponent,
    PaymentOrderDetailModalComponent,
    PaymentFilterComponent,
    CreatePaymentComponent,
    FinancialActivitiesDetailComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    InvoicesRoutingModule,
    NgOptimizedImage,
    ScrollingModule,
  ],
  providers: [
    PaymentOrdersClient,
    CurrenciesClient,
    InvoicesClient,
    WalletsClient,
    FinancialClient,
  ],
  exports: [
    InvoicesComponent,
    FinancialActivitiesComponent,
    FinancialActivitiesFilterComponent,
    CustomerSearchComponent,
    WalletOrderStatePipe,
  ],
})
export class FinancialModule {}
