import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import {
  CurrenciesClient,
  PriceListsClient,
  WalletsClient,
} from "@app/proxy/proxy";
import {
  BuyOrdersClient,
  CurrenciesClient as ShopCurrenciesClient,
} from "@app/proxy/shop-proxy";
import { SharedModule } from "@app/shared/shared.module";
import { MaskitoModule } from "@maskito/angular";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { CategoryCardComponent } from "./component/category-card/category-card.component";
import { CheckoutComponent } from "./component/checkout/checkout.component";
import { OrderComponent } from "./component/order/order.component";
import { ProductBarcodeModalComponent } from "./component/product-barcode-modal/product-barcode-modal.component";
import { ProductCardComponent } from "./component/product-card/product-card.component";
import { ProductDescriptionModalComponent } from "./component/product-description-modal/product-description-modal.component";
import { ReceiveComponent } from "./component/receive/receive.component";
import { EGiftRoutingModule } from "./e-gift-routing.module";
import { EGiftService } from "./service/e-gift.service";
import { CategoriesComponent } from "./view/categories/categories.component";
import { EGiftComponent } from "./view/e-gift/e-gift.component";
import { SearchViewComponent } from "./view/search-view/search-view.component";
import { ExchangeService } from "@app/core/services";
import { ShopService } from "../shop/service/shop.service";

@NgModule({
  declarations: [
    EGiftComponent,
    SearchViewComponent,
    ProductCardComponent,
    CategoryCardComponent,
    OrderComponent,
    ProductDescriptionModalComponent,
    CheckoutComponent,
    ReceiveComponent,
    ProductBarcodeModalComponent,
    CategoriesComponent,
  ],
  imports: [
    SharedModule,
    EGiftRoutingModule,
    ScrollingModule,
    MaskitoModule,
    CoreModule,
    LazyLoadImageModule,
    NgOptimizedImage,
  ],
  providers: [
    EGiftService,
    BuyOrdersClient,
    PriceListsClient,
    WalletsClient,
    CurrenciesClient,
    ShopCurrenciesClient,
    ExchangeService,
    ShopService,
  ],
})
export class EGiftModule {}
