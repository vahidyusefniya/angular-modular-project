import { NgModule } from "@angular/core";

import { CoreModule } from "@app/core/core.module";
import { BuyOrdersClient } from "@app/proxy/shop-proxy";
import { SharedModule } from "@app/shared/shared.module";
import { OrderCardComponent } from "./component/order-card/order-card.component";
import { OrderFilterComponent } from "./component/order-filter/order-filter.component";
import { OrdersRoutingModule } from "./orders-routing.module";
import { OrdersComponent } from "./view/orders.component";
import { SendEmailComponent } from "./component/send-email/send-email.component";

@NgModule({
  declarations: [OrdersComponent, OrderFilterComponent, OrderCardComponent, SendEmailComponent],
  imports: [SharedModule, OrdersRoutingModule, CoreModule],
  providers: [BuyOrdersClient],
})
export class OrdersModule {}
