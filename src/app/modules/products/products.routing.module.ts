import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { ProductListComponent } from "./view/product-list/product-list.component";

const routes: Routes = [
  {
    path: "",
    component: ProductListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
