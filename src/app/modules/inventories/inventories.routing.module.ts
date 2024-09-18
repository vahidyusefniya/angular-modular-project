import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { AvailableItemsComponent } from "./view/available-items/available-items.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "available-items",
    pathMatch: "full",
  },
  {
    path: "available-items",
    component: AvailableItemsComponent,
    data: {
      breadcrumb: dictionary.AvailableItems,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoriesRoutingModule {}
