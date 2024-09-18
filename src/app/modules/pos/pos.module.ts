import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { PosRoutingModule } from "./pos-routing.module";
import { SharedModule } from "@app/shared/shared.module";
import { CoreModule } from "@app/core/core.module";
import { DefinePosComponent } from "./view/define-pos/define-pos.component";
import {
  CurrenciesClient,
  PaymentOrdersClient,
  PaymentProviderClient,
  PosOrdersClient,
  PosesClient,
  SystemClient,
} from "@app/proxy/proxy";
import { AddComponent } from "./component/add/add.component";
import { MaskitoModule } from "@maskito/angular";
import { EditComponent } from "./component/edit/edit.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { ShopComponent } from "./view/shop/shop.component";
import { ShopCardComponent } from "./component/shop-card/shop-card.component";
import { ShopCardBuyComponent } from "./component/shop-card-buy/shop-card-buy.component";
import { OrdersComponent } from "./view/orders/orders.component";
import { OrdersFilterComponent } from "./component/orders-filter/orders-filter.component";
import { OrderDetailComponent } from "./component/order-detail/order-detail.component";
import { OrderDescriptionComponent } from "./component/order-description/order-description.component";
import { AllOrdersComponent } from "./view/all-orders/all-orders.component";
import { ChangeStateModalComponent } from "./component/change-state-modal/change-state-modal.component";

@NgModule({
  declarations: [
    DefinePosComponent,
    AddComponent,
    EditComponent,
    ShopComponent,
    ShopCardComponent,
    ShopCardBuyComponent,
    OrdersComponent,
    OrdersFilterComponent,
    OrderDetailComponent,
    OrderDescriptionComponent,
    AllOrdersComponent,
    ChangeStateModalComponent,
  ],
  imports: [
    CommonModule,
    PosRoutingModule,
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
    PosesClient,
    CurrenciesClient,
    PosOrdersClient,
    PaymentOrdersClient,
    PaymentProviderClient,
    SystemClient,
  ],
})
export class PosModule {}
