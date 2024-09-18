import { NgModule } from "@angular/core";

import { SharedModule } from "@app/shared/shared.module";
import { MobileShopRoutingModule } from "./mobile-shop-routing.module";
import { ShopComponent } from "./view/shop/shop.component";

@NgModule({
  declarations: [ShopComponent],
  imports: [SharedModule, MobileShopRoutingModule],
})
export class MobileShopModule {}
