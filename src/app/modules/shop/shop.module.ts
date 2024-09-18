import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  PriceListsClient,
  ProductsClient,
  WalletsClient,
} from "@app/proxy/proxy";
import { CoreModule } from "@core/core.module";
import { MaskitoModule } from "@maskito/angular";
import { SharedModule } from "@shared/shared.module";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { EGiftService } from "../e-gift/service/e-gift.service";
import { BuyComponent } from "./component/buy/buy.component";
import { FavoritesSectionComponent } from "./component/favorites-section/favorites-section.component";
import { ProductDescriptionModalComponent } from "./component/product-description-modal/product-description-modal.component";
import { ShopCardComponent } from "./component/shop-card/shop-card.component";
import { VerifyComponent } from "./component/verify/verify.component";
import { SafePipe } from "./pipe/safe.pipe";
import { ShopService } from "./service/shop.service";
import { ShopRoutingModule } from "./shop.routing.module";
import { ShopComponent } from "./view/shop/shop.component";
import { BuyOrdersClient, CurrenciesClient } from "@app/proxy/shop-proxy";

@NgModule({
  declarations: [
    ShopComponent,
    SafePipe,
    ShopCardComponent,
    ProductDescriptionModalComponent,
    BuyComponent,
    VerifyComponent,
    FavoritesSectionComponent,
  ],
  imports: [
    ScrollingModule,
    ShopRoutingModule,
    SharedModule,
    CoreModule,
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
    CurrenciesClient,
  ],
})
export class ShopModule {}
