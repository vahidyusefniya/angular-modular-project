import { NgOptimizedImage } from "@angular/common";
import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouteReuseStrategy } from "@angular/router";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { ServiceWorkerModule } from "@angular/service-worker";
import {
  ApplicationComponent,
  DesktopAppComponent,
  MenuListItemComponent,
  MobileAppComponent,
  NavService,
  NotfoundComponent,
  PhysicalBackButtonBrowserDirective,
  ResizeDirective,
  BasketItemsComponent,
  PlaceOrderComponent
} from "@app/layout";
import { CoreModule } from "@core/core.module";
import { environment } from "@environments/environment";
import {
  AuthenticationClient,
  BranchesClient,
  BuyOrdersClient,
  PhysicalCardsClient,
  API_BASE_URL as RETAIL_API_BASE_URL,
  TeamClient,
} from "@proxy/proxy";

import {
  ProductsClient,
  API_BASE_URL as SHOP_API_BASE_URL,
} from "@proxy/shop-proxy";
import { SharedModule } from "@shared/shared.module";
import { ThemeService } from "@theme/theme.service";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import {
  BuildDetailsService,
  UpToDateBuildService,
} from "@app/auto-app-updater";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { AuthModule } from "./auth";
import { CardInfoComponent } from "./layout/view/card-info/card-info.component";

@NgModule({
  declarations: [
    AppComponent,
    ApplicationComponent,
    PhysicalBackButtonBrowserDirective,
    ResizeDirective,
    MenuListItemComponent,
    MobileAppComponent,
    DesktopAppComponent,
    NotfoundComponent,
    CardInfoComponent,
    BasketItemsComponent,
    PlaceOrderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    IonicModule.forRoot({
      innerHTMLTemplatesEnabled: true,
    }),
    AppRoutingModule,
    CoreModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
    NgOptimizedImage,
    LazyLoadImageModule,
    AuthModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    BranchesClient,
    NavService,
    {
      provide: RETAIL_API_BASE_URL,
      useValue: environment.Base__Url,
    },
    {
      provide: SHOP_API_BASE_URL,
      useValue: environment.SHOP_API_BASE_URL,
    },
    ThemeService,
    AuthenticationClient,
    BuyOrdersClient,
    ProductsClient,
    TeamClient,
    PhysicalCardsClient,
    BuildDetailsService,
    UpToDateBuildService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
