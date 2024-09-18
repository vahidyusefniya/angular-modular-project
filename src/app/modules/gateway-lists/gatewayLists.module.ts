import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import { GatewayListsClient, SystemClient } from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { ShowCustomersComponent } from "./component/show-customers/show-customers.component";
import { GatewayListsRoutingModule } from "./gatewayLists.routing.module";
import { AddComponent } from "./view/add/add.component";
import { EditComponent } from "./view/edit/edit.component";
import { GatewayListsComponent } from "./view/gateway-lists/gateway-lists.component";

@NgModule({
  declarations: [
    GatewayListsComponent,
    AddComponent,
    EditComponent,
    ShowCustomersComponent,
  ],
  imports: [GatewayListsRoutingModule, SharedModule, CoreModule],
  providers: [GatewayListsClient, SystemClient],
})
export class GatewayListsModule {}
