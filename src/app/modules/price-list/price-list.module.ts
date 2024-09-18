import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";
import {
  CategoriesClient,
  CurrenciesClient,
  PriceListsClient,
  ProductsClient,
  SystemClient,
} from "@app/proxy/proxy";
import { CoreModule } from "@core/core.module";
import { MaskitoModule } from "@maskito/angular";
import { SharedModule } from "@shared/shared.module";
import { ImportBulkPricesModalComponent } from "./component/import-bulk-prices-modal/import-bulk-prices-modal.component";
import { MyPriceListFilterComponent } from "./component/my-price-list-filter/my-price-list-filter.component";
import { PriceCreateComponent } from "./component/price-create/price-create.component";
import { PriceEditComponent } from "./component/price-edit/price-edit.component";
import { PriceListCreateComponent } from "./component/price-list-create/price-list-create.component";
import { PricesFilterComponent } from "./component/prices-filter/prices-filter.component";
import { ProductSearchComponent } from "./component/product-search/product-search.component";
import { RuleCreateComponent } from "./component/rule-create/rule-create.component";
import { RuleEditComponent } from "./component/rule-edit/rule-edit.component";
import { RulesFilterComponent } from "./component/rules-filter/rules-filter.component";
import { StepInputDirective } from "./directive/step-input.directive";
import { PriceListRoutingModule } from "./price-list.routing.module";
import { PriceListService } from "./service/price-list.service";
import { MyPriceListComponent } from "./view/my-price-list/my-price-list.component";
import { PriceListPricesComponent } from "./view/price-list-prices/price-list-prices.component";
import { PriceListsComponent } from "./view/price-lists/price-lists.component";
import { TruncateDecimalsPipe } from "@app/shared/pipes";

@NgModule({
  declarations: [
    PriceListsComponent,
    PriceListCreateComponent,
    PriceListPricesComponent,
    PriceCreateComponent,
    RuleCreateComponent,
    RuleEditComponent,
    PriceEditComponent,
    ProductSearchComponent,
    StepInputDirective,
    PricesFilterComponent,
    RulesFilterComponent,
    ImportBulkPricesModalComponent,
    MyPriceListComponent,
    MyPriceListFilterComponent,
  ],
  imports: [
    PriceListRoutingModule,
    SharedModule,
    CoreModule,
    ScrollingModule,
    MaskitoModule,
  ],
  exports: [
    PriceListPricesComponent,
    SharedModule,
    CoreModule,
    ScrollingModule,
    MaskitoModule,
  ],
  providers: [
    PriceListService,
    PriceListsClient,
    ProductsClient,
    CurrenciesClient,
    SystemClient,
    CategoriesClient,
    TruncateDecimalsPipe
  ],
})
export class PriceListModule { }
