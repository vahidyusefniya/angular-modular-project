import { NgModule } from "@angular/core";

import { CoreModule } from "@app/core/core.module";
import { CategoriesClient } from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { CategoryRoutingModule } from "./category-routing.module";
import { CategoryListComponent } from "./view/category-list/category-list.component";
import { CategoryCreateComponent } from "./component/category-create/category-create.component";

@NgModule({
  declarations: [CategoryListComponent, CategoryCreateComponent],
  imports: [SharedModule, CategoryRoutingModule, CoreModule],
  providers: [CategoriesClient],
})
export class CategoryModule {}
