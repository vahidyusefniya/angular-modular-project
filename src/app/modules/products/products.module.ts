import { NgModule } from "@angular/core";
import { ProductListComponent } from "./view/product-list/product-list.component";
import { SearchTreeCategoryModalComponent } from "./component/search-tree-category-modal/search-tree-category-modal.component";
import { ProductEditComponent } from "./component/product-edit/product-edit.component";
import { ProductCreateComponent } from "./component/product-create/product-create.component";
import { SetBuyingPriceModalComponent } from "./component/set-buying-price-modal/set-buying-price-modal.component";
import { PriceListModule } from "../price-list/price-list.module";
import { ProductService } from "./service/product.service";
import {
  CategoriesClient,
  ProductsClient,
  RegionsClient,
  SystemClient,
} from "@app/proxy/proxy";
import { ProductsRoutingModule } from "./products.routing.module";
import { NgOptimizedImage } from "@angular/common";
import { SharedModule } from "@app/shared/shared.module";
import { CoreModule } from "@app/core/core.module";
import { RegionComponent } from "./component/region/region.component";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { ProductFilterComponent } from "./component/product-filter/product-filter.component";

@NgModule({
  declarations: [
    ProductListComponent,
    SearchTreeCategoryModalComponent,
    ProductEditComponent,
    ProductCreateComponent,
    SetBuyingPriceModalComponent,
    RegionComponent,
    ProductFilterComponent
  ],
  imports: [
    ProductsRoutingModule,
    SharedModule,
    CoreModule,
    PriceListModule,
    NgOptimizedImage,
    LazyLoadImageModule,
  ],
  providers: [ProductService, ProductsClient, SystemClient, CategoriesClient, RegionsClient],
})
export class ProductsModule {}
