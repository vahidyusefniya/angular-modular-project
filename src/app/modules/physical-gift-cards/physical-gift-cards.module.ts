import { NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import {
  BuyOrdersClient,
  PosOrdersClient,
  PriceListsClient,
  ProductsClient,
  WalletsClient,
} from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { MaskitoModule } from "@maskito/angular";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { EGiftService } from "../e-gift/service/e-gift.service";
import { ShopService } from "../shop/service/shop.service";
import { BuyComponent } from "./components/buy/buy.component";
import { ProductDescriptionModalComponent } from "./components/product-description-modal/product-description-modal.component";
import { RegionComponent } from "./components/region/region.component";
import { ShopCardComponent } from "./components/shop-card/shop-card.component";
import { VerifyComponent } from "./components/verify/verify.component";
import { PhysicalGiftCardsRoutingModule } from "./physical-gift-cards-routing.module";
import { ActivateCardsComponent } from "./view/activate-cards/activate-cards.component";
import { CheckCardComponent } from "./view/check-card/check-card.component";
import { PhysicalShopComponent } from "./view/physical-shop/physical-shop.component";
import { CurrenciesClient, PhysicalCardsClient } from "@app/proxy/shop-proxy";
import { ProductCardComponent } from "./components/product-card/product-card.component";
import { ConfirmComponent } from "./components/confirm/confirm.component";
import { RangeFormComponent } from "./components/range-form/range-form.component";
import { OrdersComponent } from "./view/orders/orders.component";
import { OrderDetailComponent } from "./components/order-detail/order-detail.component";
import { OrdersFilterComponent } from "./components/orders-filter/orders-filter.component";
import { CustomerOrdersComponent } from "./view/customer-orders/customer-orders.component";
import { ChangeStateModalComponent } from "./components/change-state-modal/change-state-modal.component";


@NgModule({
  declarations: [
    ActivateCardsComponent,
    CheckCardComponent,
    BuyComponent,
    ProductDescriptionModalComponent,
    ShopCardComponent,
    VerifyComponent,
    RegionComponent,
    PhysicalShopComponent,
    ProductCardComponent,
    ConfirmComponent,
    RangeFormComponent,
    OrdersComponent,
    OrderDetailComponent,
    OrdersFilterComponent,
    CustomerOrdersComponent,
    ChangeStateModalComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    PhysicalGiftCardsRoutingModule,
    MaskitoModule,
    LazyLoadImageModule,
    NgOptimizedImage,
  ],
  providers: [
    ShopService,
    EGiftService,
    BuyOrdersClient,
    PriceListsClient,
    ProductsClient,
    WalletsClient,
    PhysicalCardsClient,
    CurrenciesClient,
    PosOrdersClient
  ],
})
export class PhysicalGiftCardsModule {}
