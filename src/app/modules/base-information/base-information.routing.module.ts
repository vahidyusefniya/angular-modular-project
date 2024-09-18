import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { BanksComponent } from "@modules/base-information/banks/view/banks/banks.component";
import { ProductListComponent } from "../products/view/product-list/product-list.component";
import { CategoriesComponent } from "./categories/view/categories/categories.component";
import { CurrenciesComponent } from "./currencies/view/currencies/currencies.component";
import { RegionsComponent } from "./region/view/regions/regions.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "categories",
    pathMatch: "full",
  },
  {
    path: "categories",
    component: CategoriesComponent,
    data: {
      breadcrumb: dictionary.Categories,
    },
  },
  {
    path: "currencies",
    component: CurrenciesComponent,
    data: {
      breadcrumb: dictionary.Currencies,
    },
  },
  {
    path: "regions",
    component: RegionsComponent,
    data: {
      breadcrumb: dictionary.Regions,
    },
  },
  {
    path: "products",
    component: ProductListComponent,
    data: {
      breadcrumb: dictionary.Products,
    },
  },
  {
    path: "banks",
    component: BanksComponent,
    data: {
      breadcrumb: dictionary.Banks,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaseInformationRoutingModule {}
