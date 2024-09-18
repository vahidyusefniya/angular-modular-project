import { NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  BanksClient,
  CategoriesClient,
  CurrenciesClient,
  MerchantsClient,
  ProductsClient,
  RegionsClient,
  SystemClient,
} from "@app/proxy/proxy";
import { AddBankComponent } from "@modules/base-information/banks/component/add-bank/add-bank.component";
import { EditBankComponent } from "@modules/base-information/banks/component/edit-bank/edit-bank.component";
import { BanksComponent } from "@modules/base-information/banks/view/banks/banks.component";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { PriceListModule } from "../price-list/price-list.module";
import { BaseInformationRoutingModule } from "./base-information.routing.module";
import { AddCategoryComponent } from "./categories/component/add-category/add-category.component";
import { EditCategoryComponent } from "./categories/component/edit-category/edit-category.component";
import { CategoriesComponent } from "./categories/view/categories/categories.component";
import { AddCurrencyComponent } from "./currencies/component/add-currency/add-currency.component";
import { EditCurrencyComponent } from "./currencies/component/edit-currency/edit-currency.component";
import { CurrenciesComponent } from "./currencies/view/currencies/currencies.component";
import { NewMerchantComponent } from "./merchants/components/new-merchant/new-merchant.component";
import { MerchantsComponent } from "./merchants/view/merchants/merchants.component";
import { ProductCreateComponent } from "./product/component/product-create/product-create.component";
import { ProductEditComponent } from "./product/component/product-edit/product-edit.component";
import { SearchTreeCategoryModalComponent } from "./product/component/search-tree-category-modal/search-tree-category-modal.component";
import { SetBuyingPriceModalComponent } from "./product/component/set-buying-price-modal/set-buying-price-modal.component";
import { ProductService } from "./product/service/product.service";
import { ProductListComponent } from "./product/view/product-list/product-list.component";
import { AddRegionComponent } from "./region/component/add-region/add-region.component";
import { EditRegionComponent } from "./region/component/edit-region/edit-region.component";
import { RegionsComponent } from "./region/view/regions/regions.component";

@NgModule({
  declarations: [
    CategoriesComponent,
    AddCategoryComponent,
    CurrenciesComponent,
    AddCurrencyComponent,
    EditCurrencyComponent,
    EditCategoryComponent,
    MerchantsComponent,
    NewMerchantComponent,
    ProductListComponent,
    SearchTreeCategoryModalComponent,
    ProductEditComponent,
    ProductCreateComponent,
    SetBuyingPriceModalComponent,
    BanksComponent,
    AddBankComponent,
    EditBankComponent,
    RegionsComponent,
    AddRegionComponent,
    EditRegionComponent,
  ],
  imports: [
    BaseInformationRoutingModule,
    NgOptimizedImage,
    PriceListModule,
    LazyLoadImageModule,
  ],
  providers: [
    CategoriesClient,
    CurrenciesClient,
    MerchantsClient,
    ProductService,
    ProductsClient,
    SystemClient,
    BanksClient,
    RegionsClient,
  ],
})
export class BaseInformationModule {}
