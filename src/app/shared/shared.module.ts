import { CommonModule, NgOptimizedImage } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CoreModule } from "@core/core.module";
import { IonicModule } from "@ionic/angular";
import { MaskitoModule } from "@maskito/angular";

import {
  AuthenticationClient,
  PriceListsClient,
  ProductsClient,
  RegionsClient,
  WalletsClient,
} from "@app/proxy/proxy";
import { BuyOrdersClient } from "@app/proxy/shop-proxy";
import { LazyLoadImageModule } from "ng-lazyload-image";
import {
  AmountPipe,
  Base64ImageComponent,
  BreadcrumbComponent,
  ComboboxComponent,
  CountriesComponent,
  CurrencyComboboxComponent,
  DatePickerComponent,
  IconComponent,
  MultiSelectComponent,
  MultiSelectModalComponent,
  NumberComponent,
  PageListComponent,
  PhoneHeaderLayoutComponent,
  PhoneHeaderLayoutService,
  RadioListComponent,
  SafePipe,
  SetPinModalComponent,
  TableFilterTagComponent,
  TextAreaInputComponent,
  TextComponent,
  TimezonesComponent,
  TwoFaExceptionComponent,
} from "./components";
import { MobileComponent } from "./components/inputs/mobile/mobile.component";
import {
  CardNumberMaskDirective,
  DateMaskDirective,
  DirtyPageDirective,
  MaxValueDirective,
  MinValueDirective,
  PreventNavigateNumberDirective,
  PreventZeroNumberDirective,
} from "./directives";
import { DesktopGuard, MobileGuard } from "./guards";
import { PermissionDirective } from "./permission/permission.directive";
import {
  ConvertLocalDateTimePipe,
  TruncateDecimalsPipe,
  TruncatePipe,
} from "./pipes";
import { PrimeNgModule } from "./prime-ng.module";
import { BuyComponent } from "./shared-components/components/buy/buy.component";
import { ChooseBranchComponent } from "./shared-components/components/choose-branch/choose-branch.component";
import { CustomerModalComponent } from "./shared-components/components/customer-modal/customer-modal.component";
import { ProductDescriptionModalComponent } from "./shared-components/components/product-description-modal/product-description-modal.component";
import { RegionComponent } from "./shared-components/components/region/region.component";
import { SearchTreeCategoryModalComponent } from "./shared-components/components/search-tree-category-modal/search-tree-category-modal.component";
import { ShopCardComponent } from "./shared-components/components/shop-card/shop-card.component";
import { VerifyComponent } from "./shared-components/components/verify/verify.component";
import { ActivateShopComponent } from "./shared-components/view/activate-shop/activate-shop.component";

@NgModule({
  declarations: [
    IconComponent,
    TextComponent,
    CardNumberMaskDirective,
    DateMaskDirective,
    DatePickerComponent,
    ComboboxComponent,
    BreadcrumbComponent,
    TableFilterTagComponent,
    MultiSelectComponent,
    TextAreaInputComponent,
    PageListComponent,
    AmountPipe,
    SafePipe,
    ConvertLocalDateTimePipe,
    TruncatePipe,
    NumberComponent,
    MultiSelectModalComponent,
    PhoneHeaderLayoutComponent,
    MaxValueDirective,
    MinValueDirective,
    PermissionDirective,
    PreventNavigateNumberDirective,
    PreventZeroNumberDirective,
    ActivateShopComponent,
    BuyComponent,
    ShopCardComponent,
    VerifyComponent,
    ProductDescriptionModalComponent,
    TruncateDecimalsPipe,
    DirtyPageDirective,
    ChooseBranchComponent,
    RegionComponent,
    MobileComponent,
    CountriesComponent,
    Base64ImageComponent,
    CurrencyComboboxComponent,
    SearchTreeCategoryModalComponent,
    TimezonesComponent,
    RadioListComponent,
    CustomerModalComponent,
    TwoFaExceptionComponent,
    SetPinModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    PrimeNgModule,
    IonicModule,
    RouterModule,
    MaskitoModule,
    NgOptimizedImage,
    LazyLoadImageModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    TextComponent,
    CardNumberMaskDirective,
    DateMaskDirective,
    MaxValueDirective,
    MinValueDirective,
    PrimeNgModule,
    DatePickerComponent,
    ComboboxComponent,
    BreadcrumbComponent,
    TableFilterTagComponent,
    MultiSelectComponent,
    TextAreaInputComponent,
    IonicModule,
    PageListComponent,
    AmountPipe,
    SafePipe,
    ConvertLocalDateTimePipe,
    TruncatePipe,
    NumberComponent,
    MultiSelectModalComponent,
    PhoneHeaderLayoutComponent,
    PermissionDirective,
    PreventNavigateNumberDirective,
    PreventZeroNumberDirective,
    ActivateShopComponent,
    TruncateDecimalsPipe,
    DirtyPageDirective,
    ChooseBranchComponent,
    RegionComponent,
    MobileComponent,
    CountriesComponent,
    Base64ImageComponent,
    CurrencyComboboxComponent,
    SearchTreeCategoryModalComponent,
    TimezonesComponent,
    RadioListComponent,
    CustomerModalComponent,
    TwoFaExceptionComponent,
    SetPinModalComponent,
  ],
  providers: [
    DesktopGuard,
    MobileGuard,
    AuthenticationClient,
    PriceListsClient,
    ProductsClient,
    WalletsClient,
    RegionsClient,
    BuyOrdersClient,
    PhoneHeaderLayoutService,
  ],
})
export class SharedModule {}
