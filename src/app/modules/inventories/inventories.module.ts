import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";
import {
  CurrenciesClient,
  PriceListsClient,
  ProductsClient,
} from "@app/proxy/proxy";
import { CoreModule } from "@core/core.module";
import { SharedModule } from "@shared/shared.module";
import { ProductItemOrderFilterComponent } from "./component/product-item-order-filter/product-item-order-filter.component";
import { ProductSearchComponent } from "./component/product-search/product-search.component";
import { InventoriesRoutingModule } from "./inventories.routing.module";
import { AvailableItemsComponent } from "./view/available-items/available-items.component";
import { AvailableItemsFilterComponent } from "@modules/inventories/component/available-items-filter/available-items-filter.component";
import { ConfirmationUploadNewItemComponent } from "./component/confirmation-upload-new-item/confirmation-upload-new-item.component";

@NgModule({
  declarations: [
    AvailableItemsComponent,
    ProductSearchComponent,
    ProductItemOrderFilterComponent,
    AvailableItemsFilterComponent,
    ConfirmationUploadNewItemComponent,
  ],
  imports: [
    InventoriesRoutingModule,
    SharedModule,
    CoreModule,
    ScrollingModule,
  ],
  providers: [CurrenciesClient, ProductsClient, PriceListsClient],
})
export class InventoriesModule {}
