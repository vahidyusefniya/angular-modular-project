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
import { PostpaidFilterModalComponent } from "./component/postpaid-filter-modal/postpaid-filter-modal.component";
import { CustomerPostpaidRoutingModule } from "./customer-postpaid.routing.module";
import { CustomerPostpaidComponent } from "./view/customer-postpaid/customer-postpaid.component";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { SharedModule } from "@app/shared/shared.module";
import { CoreModule } from "@app/core/core.module";
import { MaskitoModule } from "@maskito/angular";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { LazyLoadImageModule } from "ng-lazyload-image";

@NgModule({
  declarations: [
    CustomerPostpaidComponent,
    PostpaidFilterModalComponent,
  ],
  imports: [
    CustomerPostpaidRoutingModule,
    CommonModule,
    SharedModule,
    CoreModule,
    MaskitoModule,
    ScrollingModule,
    CoreModule,
    MaskitoModule,
    LazyLoadImageModule,
    NgOptimizedImage,
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
export class CustomerPostpaidModule {}
