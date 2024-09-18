import { NgModule } from "@angular/core";

import { SharedModule } from "@app/shared/shared.module";
import { WishlistComponent } from "./view/wishlist.component";
import { WishlistRoutingModule } from "./wishlist-routing.module";

@NgModule({
  declarations: [WishlistComponent],
  imports: [SharedModule, WishlistRoutingModule],
})
export class WishlistModule {}
