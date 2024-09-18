import { NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import { ExchangeService } from "@app/core/services";
import {
  CurrenciesClient,
  PhysicalCardsClient,
  ProductsClient,
} from "@app/proxy/shop-proxy";
import { SharedModule } from "@app/shared/shared.module";
import { ZXingScannerModule } from "@zxing/ngx-scanner";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { ActivateRoutingModule } from "./activate-routing.module";
import { ActivationCodeModalComponent } from "./component/activation-code-modal/activation-code-modal.component";
import { ActivateViewComponent } from "./view/activate-view/activate-view.component";

@NgModule({
  declarations: [ActivateViewComponent, ActivationCodeModalComponent],
  imports: [
    SharedModule,
    ActivateRoutingModule,
    ZXingScannerModule,
    LazyLoadImageModule,
    NgOptimizedImage,
  ],
  providers: [
    PhysicalCardsClient,
    ProductsClient,
    CurrenciesClient,
    ExchangeService,
  ],
})
export class ActivateModule {}
