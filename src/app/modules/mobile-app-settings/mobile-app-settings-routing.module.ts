import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MobileAppSettingsViewComponent } from "./view/mobile-app-settings-view/mobile-app-settings-view.component";
import { ExchangeRateComponent } from "./view/exchange-rate/exchange-rate.component";

const routes: Routes = [
  {
    path: "",
    component: MobileAppSettingsViewComponent,
  },
  {
    path: "exchange-rate",
    component: ExchangeRateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MobileAppSettingsRoutingModule {}
