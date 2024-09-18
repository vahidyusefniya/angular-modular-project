import { NgModule } from "@angular/core";

import { NgOptimizedImage } from "@angular/common";
import { AuthenticationClient } from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { MobileAppSettingsRoutingModule } from "./mobile-app-settings-routing.module";
import { MobileAppSettingsViewComponent } from "./view/mobile-app-settings-view/mobile-app-settings-view.component";
import { ExchangeRateComponent } from "./view/exchange-rate/exchange-rate.component";
import { CurrenciesClient } from "@app/proxy/shop-proxy";
import { WheelDatepickerComponent } from "./component/wheel-datepicker/wheel-datepicker.component";

@NgModule({
  declarations: [MobileAppSettingsViewComponent, ExchangeRateComponent, WheelDatepickerComponent],
  imports: [
    SharedModule,
    MobileAppSettingsRoutingModule,
    LazyLoadImageModule,
    NgOptimizedImage,
  ],
  providers: [AuthenticationClient, CurrenciesClient],
})
export class MobileAppSettingsModule {}
