import { NgModule } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { SharedModule } from "@app/shared/shared.module";
import { CoreModule } from "@app/core/core.module";
import { MaskitoModule } from "@maskito/angular";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { PostPaidComponent } from "./view/post-paid/post-paid.component";
import { PostPaidRoutingModule } from "./post-paid-routing.module";
import { MerchantsClient, PaymentProviderClient, PostPayClient } from "@app/proxy/proxy";
import { AssignAchAccountNumbersComponent } from "./component/assign-ach-account-numbers/assign-ach-account-numbers.component";
import { PostPaidFilterComponent } from "./component/post-paid-filter/post-paid-filter.component";

@NgModule({
  declarations: [
    PostPaidComponent,
    AssignAchAccountNumbersComponent,
    PostPaidFilterComponent
  ],
  imports: [
    CommonModule,
    PostPaidRoutingModule,
    SharedModule,
    CoreModule,
    MaskitoModule,
    ScrollingModule,
    CoreModule,
    MaskitoModule,
    LazyLoadImageModule,
    NgOptimizedImage,
  ],
  providers: [
    PostPayClient,
    PaymentProviderClient,
    MerchantsClient,
  ],
})
export class PostPaidModule {}
