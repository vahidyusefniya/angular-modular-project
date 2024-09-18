import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EGiftComponent } from "./view/e-gift/e-gift.component";
import { SearchViewComponent } from "./view/search-view/search-view.component";
import { CategoriesComponent } from "./view/categories/categories.component";

const routes: Routes = [
  {
    path: "",
    component: EGiftComponent,
  },
  {
    path: "categories",
    component: CategoriesComponent,
  },
  {
    path: "search",
    component: SearchViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EGiftRoutingModule {}
