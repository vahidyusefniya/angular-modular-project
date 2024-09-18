import { NgModule } from "@angular/core";
import { GatewayListRoutingModule } from "./gateway-list-routing.module";
import { GatewayListComponent } from "./view/gateway-list/gateway-list.component";
import { SharedModule } from "@app/shared/shared.module";
import { CoreModule } from "@app/core/core.module";
import { NewGatewayComponent } from "./component/new-gateway/new-gateway.component";
import { EditGatewayComponent } from "./component/edit-gateway/edit-gateway.component";

@NgModule({
  declarations: [
    GatewayListComponent,
    NewGatewayComponent,
    EditGatewayComponent,
  ],
  imports: [GatewayListRoutingModule, SharedModule, CoreModule],
})
export class GatewayListModule {}
