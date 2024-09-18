import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GatewayListsComponent } from "./view/gateway-lists/gateway-lists.component";
import { AddComponent } from "./view/add/add.component";
import { EditComponent } from "./view/edit/edit.component";

const routes: Routes = [
  {
    path: "",
    component: GatewayListsComponent,
  },
  {
    path: "add",
    component: AddComponent,
  },
  {
    path: ":gatewayListId",
    component: EditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatewayListsRoutingModule {}
